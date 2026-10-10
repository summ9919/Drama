const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { loadModule } = require('./helpers/load-ts.cjs');
const { GUIDANCE_SCHEMA, GUIDANCE_EXAMPLE } = loadModule('src/constants/guidanceProtocol.ts');
const { parseGuidance } = loadModule('src/lib/guidanceRules.ts');
const profile = { provider: 'kimi', apiKey: 'fake-test-key', baseUrl: 'https://vision.example.test/v1', model: 'test-vlm' };
const context = { style: '清透', mode: '人像', facing: 'back', zoom: 0, flash: 'off' };
const sample = { dataUrl: 'data:image/jpeg;base64,AA==', capturedAt: 0 };
const example = JSON.parse(JSON.stringify(GUIDANCE_EXAMPLE));
const variants = [
  example,
  { ...example, state: 'adjust', route: { path: 'none', holdMs: 800 }, aimPoint: null, horizontal: 'left', summary: '向左平移手机' },
  { ...example, state: 'ready', route: { path: 'none', holdMs: 800 }, aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true, summary: '当前构图可以拍照' },
  { ...example, state: 'uncertain', route: { path: 'none', holdMs: 800 }, aimPoint: null, confidence: 0.3, summary: '画面太暗，请改善光线' },
];

test('all protocol fields are mandatory; extra keys, fenced JSON, coercion and invalid ranges are rejected', () => {
  for (const name of GUIDANCE_SCHEMA.required) {
    const value = { ...example }; delete value[name];
    assert.throws(() => parseGuidance(JSON.stringify(value)), /JSON 协议不匹配/);
  }
  const invalid = [
    { ...example, version: 1 }, { ...example, state: 'done' },
    { ...example, confidence: '0.9' }, { ...example, confidence: 1.1 },
    { ...example, readyToShoot: 'false' }, { ...example, extra: 1 },
    { ...example, aimPoint: { x: 0.5, y: 0.5, z: 0 } },
    { ...example, aimPoint: { x: -1, y: 0 } },
    { ...example, summary: ' ' }, { ...example, light: '' },
    { ...example, summary: '字'.repeat(37) },
  ];
  for (const value of invalid) assert.throws(() => parseGuidance(JSON.stringify(value)), /JSON 协议不匹配/);
  for (const text of ['null', '[]', '{}', '```json\n' + JSON.stringify(example) + '\n```', JSON.stringify(example) + ' extra', '{"version":']) {
    assert.throws(() => parseGuidance(text), /JSON 协议不匹配/);
  }
});

test('each state is renderable and contradictory completion/action combinations fail closed', () => {
  for (const value of variants) assert.equal(parseGuidance(JSON.stringify(value)).state, value.state);
  for (const value of [
    { ...example, readyToShoot: true }, { ...example, aimPoint: null },
    { ...variants[1], horizontal: 'hold' }, { ...variants[1], zoom: 'in' },
    { ...variants[2], confidence: 0.7 }, { ...variants[2], aimPoint: { x: 0.8, y: 0.2 } },
    { ...variants[2], tilt: 'down' }, { ...variants[2], readyToShoot: false },
    { ...variants[3], confidence: 0.8 }, { ...variants[3], horizontal: 'left' },
  ]) assert.throws(() => parseGuidance(JSON.stringify(value)), /JSON 协议不匹配/);
});

test('vision HTTP request includes shared schema and real image, then valid parameters render all four states', async () => {
  const { targetFromResult } = loadModule('src/lib/compositionTarget.ts');
  const { getCompositionMessage } = loadModule('src/lib/compositionMessage.ts');
  for (const value of variants) {
    let request;
    const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {}, {
      fetch: async (url, options) => {
        request = { url, body: JSON.parse(options.body) };
        return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(value) } }] }) };
      },
    });
    const advice = await analyzeCameraSample(profile, context, sample, new AbortController().signal);
    assert.equal(request.body.response_format.type, 'json_schema');
    assert.equal(request.body.response_format.json_schema.strict, true);
    assert.equal(JSON.stringify(request.body.response_format.json_schema.schema), JSON.stringify(GUIDANCE_SCHEMA));
    assert.ok(request.body.messages[0].content.includes(JSON.stringify(GUIDANCE_SCHEMA)));
    assert.equal(request.body.messages[1].content[1].image_url.url, sample.dataUrl);
    const result = { advice, capturedAt: 100, receivedAt: 150 };
    const target = targetFromResult(result, 150);
    const message = getCompositionMessage(true, target, result, false, true);
    const guide = { active: true, ready: true, enabled: true, autoZoom: true, context, result, target, status: { phase: 'ready', message: '已更新' } };
    const { CameraCapture } = loadModule('src/components/business/CameraCapture.tsx', {
      react: { default: React, useState: initial => [typeof initial === 'object' ? { width: 400, height: 866 } : initial, () => {}] },
      'react-native': { View: 'View', Text: 'Text', Pressable: 'Button', ScrollView: 'ScrollView', ActivityIndicator: 'Spinner', StyleSheet: { create: x => x } },
      'expo-camera': { CameraView: 'NativeCamera' },
      '@expo/vector-icons': { Ionicons: 'Icon' },
      'react-native-safe-area-context': { SafeAreaView: 'SafeArea', useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) },
      'expo-status-bar': { StatusBar: 'StatusBar' },
      '../../constants/theme': { colors: {} },
      '../../hooks/useCameraGuidance': { useCameraGuidance: () => guide },
      './CameraDirectionOverlay': { CameraDirectionOverlay: 'DirectionOverlay' },
      './CameraGuidanceControls': { CameraGuidanceControls: 'GuidanceControls' },
      './CameraReadyEffects': { CameraReadyFrame: 'ReadyFrame', CameraReadyNotice: 'ReadyNotice', CameraShutterHalo: 'ShutterHalo' },
    });
    const visit = node => !React.isValidElement(node) ? [] : [node, ...React.Children.toArray(node.props.children).flatMap(visit)];
    const nodes = visit(CameraCapture({ cameraRef: { current: null } }));
    assert.ok(nodes.some(node => (node.type === 'Text' && node.props.children === value.summary) || (node.type === 'ReadyNotice' && node.props.message === value.summary)), 'validated summary is actually rendered');
    assert.ok(nodes.some(node => node.type === 'Text' && React.Children.toArray(node.props.children).join('') === `光线：${value.light}`));
    assert.equal(nodes.find(node => node.type === 'DirectionOverlay').props.target, target);
    if (value.state === 'aim') { assert.equal(target.phase, 'aiming'); assert.match(message, /目标圈/); }
    if (value.state === 'adjust') { assert.equal(target, null); assert.match(message, /左/); }
    if (value.state === 'ready') { assert.equal(target.phase, 'ready'); assert.equal(message, '可以拍照了'); }
    if (value.state === 'uncertain') { assert.equal(target, null); assert.equal(message, value.summary); }
  }
});

test('official endpoints use JSON mode, custom endpoints require schema without a silent fallback', async () => {
  for (const baseUrl of ['https://api.deepseek.com', 'https://api.moonshot.cn/v1']) {
    let format;
    const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {}, { fetch: async (_url, options) => {
      format = JSON.parse(options.body).response_format;
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(example) } }] }) };
    } });
    await analyzeCameraSample({ ...profile, baseUrl }, context, sample, new AbortController().signal);
    assert.equal(format.type, 'json_object');
  }
  let requests = 0;
  const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {}, { fetch: async () => { requests++; return { ok: false, status: 422 }; } });
  await assert.rejects(analyzeCameraSample(profile, context, sample, new AbortController().signal), /JSON Schema/);
  assert.equal(requests, 1);
});

test('malformed output makes exactly one request and waits for an explicit user retry', async () => {
  let requests = 0;
  const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {
    './aiClient': { requestAICompletion: async () => { requests++; return { content: '{}' }; } },
  });
  await assert.rejects(analyzeCameraSample(profile, context, sample, new AbortController().signal), /JSON 协议不匹配/);
  assert.equal(requests, 1);
});

test('cancelled responses and network timeouts do not execute parameters or retry', async () => {
  for (const mode of ['abort', 'timeout']) {
    let requests = 0; const controller = new AbortController();
    const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {
      './aiClient': { requestAICompletion: async () => {
        requests++; if (mode === 'timeout') throw new Error('请求超时');
        controller.abort(); return { content: JSON.stringify(example) };
      } },
    });
    await assert.rejects(analyzeCameraSample(profile, context, sample, controller.signal), mode === 'abort' ? /取消/ : /超时/);
    assert.equal(requests, 1);
  }
});

test('valid-looking but truncated completion cannot drive camera actions', async () => {
  const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {}, { fetch: async () => ({
    ok: true, json: async () => ({ choices: [{ finish_reason: 'length', message: { content: JSON.stringify(variants[2]) } }] }),
  }) });
  await assert.rejects(analyzeCameraSample(profile, context, sample, new AbortController().signal), /截断/);
});

test('slow HTTP responses survive 12 seconds; 45-second timeout and cancellation clean waiting notices without retries', async () => {
  for (const outcome of ['success', 'timeout', 'cancel', 'late-body']) {
    let clock = 0, id = 0, requests = 0, requestSignal, resolveBody;
    const timers = new Map(), messages = [];
    const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
    const schedule = (callback, delay) => { timers.set(++id, { callback, at: clock + delay }); return id; };
    async function advance(ms) {
      const end = clock + ms;
      while (true) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        timers.delete(next[0]); clock = next[1].at; next[1].callback(); await flush();
      }
      clock = end; await flush();
    }
    const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {}, {
      Date: class extends Date { static now() { return clock; } },
      setTimeout: schedule, clearTimeout: key => timers.delete(key),
      fetch: async (_url, options) => {
        requests++; requestSignal = options.signal;
        const data = { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(example) } }] };
        if (outcome === 'late-body') return { ok: true, json: () => new Promise(resolve => { resolveBody = () => resolve(data); }) };
        return new Promise((resolve, reject) => {
          const timer = outcome === 'success' ? schedule(() => resolve({ ok: true, json: async () => data }), 30000) : null;
          options.signal.addEventListener('abort', () => { timers.delete(timer); reject(new Error('aborted')); });
        });
      },
    });
    const controller = new AbortController();
    const pending = analyzeCameraSample(profile, context, sample, controller.signal, text => messages.push(text));
    const checked = outcome === 'success' ? pending : assert.rejects(pending, outcome === 'cancel' ? /已取消/ : /45 秒/);
    await flush(); await advance(12000);
    assert.equal(requestSignal.aborted, false); assert.equal(requests, 1);
    assert.ok(messages.some(text => text.includes('10 秒')));
    if (outcome === 'cancel') controller.abort();
    else if (outcome === 'success') {
      await advance(18000); assert.equal((await checked).state, 'aim');
      assert.ok(messages.some(text => text.includes('25 秒')));
      assert.equal(messages.at(-1), '正在校验本轮执行方案');
    } else {
      await advance(33000); assert.equal(requestSignal.aborted, true);
      if (resolveBody) resolveBody();
    }
    await checked; const count = messages.length;
    await advance(120000);
    assert.equal(requests, 1); assert.equal(messages.length, count); assert.equal(timers.size, 0);
  }
});

test('waiting, plan validation, updated latency and errors are visible in camera controls', () => {
  const { CameraGuidanceControls } = loadModule('src/components/business/CameraGuidanceControls.tsx', {
    react: { default: React },
    'react-native': { View: 'View', Text: 'Text', Pressable: 'Button', ActivityIndicator: 'Spinner', StyleSheet: { create: x => x } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
  });
  const visit = node => !React.isValidElement(node) ? [] : [node, ...React.Children.toArray(node.props.children).flatMap(visit)];
  for (const status of [
    { phase: 'waiting', message: '正在等待镜头就绪' },
    { phase: 'analyzing', message: '正在校验本轮执行方案' },
    { phase: 'ready', message: '已更新 · 1.2 秒' },
    { phase: 'error', message: 'JSON 协议不匹配：缺少 aimPoint' },
  ]) {
    const nodes = visit(CameraGuidanceControls({ enabled: status.phase !== 'error', status }));
    assert.equal(nodes.find(node => node.props.testID === 'guidance-request-status').props.children, status.message);
  }
});
