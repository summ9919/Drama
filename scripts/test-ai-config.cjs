// Run with: node --test scripts/test-ai-config.cjs
// Exercise configuration and HTTP behavior without sending real credentials.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(relative, mocks = {}, globals = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, URL, AbortController, setTimeout, clearTimeout, ...globals,
    require: id => {
      if (id in mocks) return mocks[id];
      if (id.startsWith('.')) return loadModule(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${id}.ts`)), mocks, globals);
      throw new Error(`Unexpected dependency: ${id}`);
    },
  }, { filename });
  return exports;
}

const profile = { apiKey: 'test-key-not-real', baseUrl: 'https://api.deepseek.com', model: 'deepseek-flash' };

test('normalizes endpoints and rejects unsafe URLs or empty fields', () => {
  const { validateAIProfile } = loadModule('src/lib/aiClient.ts');
  assert.equal(validateAIProfile({ ...profile, baseUrl: ' https://api.moonshot.cn/v1/chat/completions/ ' }).baseUrl, 'https://api.moonshot.cn/v1');
  for (const baseUrl of ['http://example.com', 'https://user:pass@example.com', 'https://example.com?key=secret', 'https://example.com#key', 'invalid']) {
    assert.throws(() => validateAIProfile({ ...profile, baseUrl }));
  }
  assert.throws(() => validateAIProfile({ ...profile, apiKey: ' ' }));
  assert.throws(() => validateAIProfile({ ...profile, model: '' }));
});

test('connection test sends a minimal text request and K3 reasoning option', async () => {
  let sent;
  const { testAIConnection } = loadModule('src/lib/aiClient.ts', {}, { fetch: async (url, options) => {
    sent = { url, ...options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'OK' } }] }) };
  } });
  await testAIConnection('kimi', { ...profile, model: 'kimi-k3', baseUrl: 'https://api.moonshot.cn/v1' });
  assert.equal(sent.url, 'https://api.moonshot.cn/v1/chat/completions');
  assert.equal(sent.headers.Authorization, `Bearer ${profile.apiKey}`);
  assert.equal(sent.body.reasoning_effort, 'low');
  assert.equal(sent.body.messages.length, 1);
  assert.equal(typeof sent.body.messages[0].content, 'string');
  await testAIConnection('deepseek', profile);
  assert.equal('reasoning_effort' in sent.body, false);
});

test('HTTP errors are actionable without exposing response bodies', async () => {
  for (const [status, message] of [[401, 'API Key'], [402, '余额'], [404, '找不到'], [429, '额度'], [500, 'HTTP 500']]) {
    const { testAIConnection } = loadModule('src/lib/aiClient.ts', {}, { fetch: async () => ({ ok: false, status, json: async () => { throw new Error('Must not read provider errors'); } }) });
    await assert.rejects(testAIConnection('deepseek', profile), error => error.message.includes(message) && !error.message.includes(profile.apiKey));
  }
});

test('custom connection uses the supplied endpoint, model and key without provider-specific options', async () => {
  let sent;
  const { testAIConnection } = loadModule('src/lib/aiClient.ts', {}, { fetch: async (url, options) => {
    sent = { url, ...options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'OK' } }] }) };
  } });
  await testAIConnection('custom', {
    apiKey: ' custom-test-secret ', baseUrl: ' https://vision.example.test/api/v1/chat/completions/ ', model: ' custom-vision-model ',
  });
  assert.equal(sent.url, 'https://vision.example.test/api/v1/chat/completions');
  assert.equal(sent.headers.Authorization, 'Bearer custom-test-secret');
  assert.equal(sent.body.model, 'custom-vision-model');
  assert.equal('reasoning_effort' in sent.body, false);
  assert.equal('response_format' in sent.body, false);
  assert.equal(typeof sent.body.messages[0].content, 'string');
});

test('empty / invalid successful responses do not falsely pass the test', async () => {
  for (const json of [async () => ({}), async () => ({ choices: [{ message: { content: '' } }] }), async () => { throw new Error('bad JSON'); }]) {
    const { testAIConnection } = loadModule('src/lib/aiClient.ts', {}, { fetch: async () => ({ ok: true, json }) });
    await assert.rejects(testAIConnection('deepseek', profile));
  }
});

test('requests time out and can be cancelled when leaving the page', async () => {
  const fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(new Error('aborted'));
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  });
  const timedClient = loadModule('src/lib/aiClient.ts', {}, { fetch, setTimeout: callback => setTimeout(callback, 5) });
  await assert.rejects(timedClient.testAIConnection('deepseek', profile), /45 秒/);
  const client = loadModule('src/lib/aiClient.ts', {}, { fetch });
  const controller = new AbortController();
  const pending = client.testAIConnection('deepseek', profile, controller.signal);
  controller.abort();
  await assert.rejects(pending, /已取消/);
});

test('providers survive reload independently; ordinary storage never contains keys', async () => {
  let raw;
  const keys = {};
  const config = loadModule('src/lib/aiConfig.ts', {
    './storage': { captureStorage: { get: async () => raw, set: async (_key, value) => { raw = value; } } },
    './aiSecrets': { readAIKey: async provider => keys[provider], writeAIKey: async (provider, key) => { keys[provider] = key; } },
  });
  assert.equal((await config.loadAISettings()).provider, 'deepseek');
  await config.saveAIProfile('deepseek', profile);
  await config.saveAIProfile('kimi', { apiKey: 'kimi-test-secret', model: 'kimi-k3', baseUrl: 'https://api.moonshot.cn/v1' });
  const saved = await config.loadAISettings();
  assert.equal(saved.provider, 'kimi');
  assert.equal(saved.profiles.deepseek.apiKey, profile.apiKey);
  assert.equal(saved.profiles.kimi.apiKey, 'kimi-test-secret');
  assert.equal(raw.includes('apiKey'), false);
  assert.equal(raw.includes('test-secret'), false);
  assert.equal(raw.includes(profile.apiKey), false);
  await config.clearAIKey('kimi');
  assert.equal((await config.getActiveAIConfig()).apiKey, '');
  assert.equal((await config.loadAISettings()).profiles.deepseek.apiKey, profile.apiKey);
});

test('legacy settings gain an independent custom profile that survives selection, reload and key removal', async () => {
  let raw = JSON.stringify({ provider: 'kimi', profiles: {
    deepseek: { baseUrl: profile.baseUrl, model: profile.model },
    kimi: { baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k3' },
  } });
  const keys = { deepseek: profile.apiKey, kimi: 'kimi-test-secret' };
  const mocks = {
    './storage': { captureStorage: { get: async () => raw, set: async (_key, value) => { raw = value; } } },
    './aiSecrets': { readAIKey: async provider => keys[provider], writeAIKey: async (provider, key) => { keys[provider] = key; } },
  };
  const config = loadModule('src/lib/aiConfig.ts', mocks);
  const legacy = await config.loadAISettings();
  assert.equal(legacy.provider, 'kimi');
  assert.equal(legacy.profiles.custom.apiKey, '');
  assert.equal(legacy.profiles.custom.baseUrl, '');
  assert.equal(legacy.profiles.custom.model, '');
  const custom = { apiKey: 'custom-test-secret', baseUrl: 'https://vision.example.test/v1', model: 'custom-vision-model' };
  await config.saveAIProfile('custom', custom);
  const reloaded = loadModule('src/lib/aiConfig.ts', mocks);
  const active = await reloaded.getActiveAIConfig();
  assert.equal(active.provider, 'custom');
  for (const field of ['apiKey', 'baseUrl', 'model']) assert.equal(active[field], custom[field]);
  assert.equal(raw.includes('apiKey'), false);
  for (const key of Object.values(keys)) assert.equal(raw.includes(key), false);
  await reloaded.saveAIProfile('deepseek', profile);
  assert.equal((await reloaded.loadAISettings()).profiles.custom.apiKey, custom.apiKey);
  assert.equal((await reloaded.loadAISettings()).profiles.custom.baseUrl, custom.baseUrl);
  await reloaded.clearAIKey('custom');
  const cleared = await reloaded.loadAISettings();
  assert.equal(cleared.provider, 'deepseek');
  assert.equal(cleared.profiles.custom.apiKey, '');
  assert.equal(cleared.profiles.custom.model, custom.model);
  assert.equal(cleared.profiles.deepseek.apiKey, profile.apiKey);
  assert.equal(cleared.profiles.kimi.apiKey, 'kimi-test-secret');
});

test('web keys persist only in module memory and can be removed', async () => {
  const secrets = loadModule('src/lib/aiSecrets.web.ts');
  await secrets.writeAIKey('deepseek', profile.apiKey);
  assert.equal(await secrets.readAIKey('deepseek'), profile.apiKey);
  assert.equal(await loadModule('src/lib/aiSecrets.web.ts').readAIKey('deepseek'), null);
  await secrets.writeAIKey('deepseek', '');
  assert.equal(await secrets.readAIKey('deepseek'), null);
  await secrets.writeAIKey('custom', 'custom-test-secret');
  assert.equal(await secrets.readAIKey('custom'), 'custom-test-secret');
  assert.equal(await loadModule('src/lib/aiSecrets.web.ts').readAIKey('custom'), null);
  await secrets.writeAIKey('custom', '');
  assert.equal(await secrets.readAIKey('custom'), null);
});
