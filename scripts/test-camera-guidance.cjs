const test = require('node:test');
const assert = require('node:assert/strict');
const { loadModule } = require('./helpers/load-ts.cjs');

const advice = { version: 3, route: { path: 'none', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: 1.15, flash: 'keep' }, state: 'adjust', aimPoint: null, readyToShoot: false, summary: '主体稍小，可以小幅拉近', horizontal: 'hold', vertical: 'hold', tilt: 'hold', distance: 'hold', zoom: 'in', light: '保持柔和侧光', confidence: 0.9 };
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

function session(overrides = {}) {
  let clock = 1000;
  let id = 0;
  const timers = new Map();
  const results = [], statuses = [];
  let samples = 0, requests = 0, fatals = 0;
  const { GuidanceLoop } = loadModule('src/lib/guidanceLoop.ts');
  const loop = new GuidanceLoop({
    canSample: () => true,
    sample: async () => { samples++; return { dataUrl: 'data:image/jpeg;base64,AA==', capturedAt: clock }; },
    analyze: async () => { requests++; return advice; },
    onResult: value => results.push(value), onStatus: value => statuses.push(value), onFatal: () => { fatals++; },
    now: () => clock,
    schedule: (callback, delay) => { timers.set(++id, { callback, at: clock + delay }); return id; },
    unschedule: timer => timers.delete(timer), ...overrides,
  });
  async function advance(ms) {
    const target = clock + ms;
    for (let step = 0; step < 1000; step++) {
      const next = [...timers.entries()].filter(([, item]) => item.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      timers.delete(next[0]); clock = next[1].at; next[1].callback(); await flush();
    }
    clock = target; await flush();
  }
  return { loop, results, statuses, advance, now: () => clock, counts: () => ({ samples, requests, fatals, timers: timers.size }) };
}

test('rejects malformed model actions; low confidence cannot move the camera', () => {
  const { parseGuidance } = loadModule('src/lib/guidanceRules.ts');
  for (const value of ['oops', JSON.stringify({ ...advice, zoom: '10x' }), JSON.stringify({ ...advice, confidence: 2 }), JSON.stringify({ ...advice, tilt: null })]) assert.throws(() => parseGuidance(value));
  assert.throws(() => parseGuidance(JSON.stringify({ ...advice, confidence: 0.3 })));
  const low = parseGuidance(JSON.stringify({ ...advice, state: 'uncertain', camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: null, flash: 'keep' }, zoom: 'hold', confidence: 0.3 }));
  assert.equal(low.zoom, 'hold');
  assert.throws(() => parseGuidance(JSON.stringify({ ...advice, distance: 'farther' })));
  assert.throws(() => parseGuidance('```json\n' + JSON.stringify(advice) + '\n```'));
});



test('sampling and analysis are serial; stopping removes future work', async () => {
  const pending = deferred(); let requests = 0;
  const s = session({ analyze: async () => { requests++; return pending.promise; } });
  s.loop.start(); await s.advance(1000); await s.advance(6000);
  assert.equal(s.counts().samples, 1); assert.equal(requests, 1);
  pending.resolve(advice); await flush();
  assert.equal(s.results.filter(Boolean).length, 1);
  s.loop.stop(); await s.advance(60000);
  assert.equal(s.counts().samples, 1); assert.equal(s.counts().timers, 0);
});

test('one completed request stays idle until explicit replan; repeated replan taps are coalesced', async () => {
  const s = session(); s.loop.start(); await s.advance(350);
  assert.equal(s.counts().requests, 1);
  await s.advance(120000);
  assert.equal(s.counts().requests, 1); assert.equal(s.counts().timers, 0);
  assert.ok(s.results.at(-1));
  s.loop.invalidate(); s.loop.invalidate();
  await s.advance(350); assert.equal(s.counts().requests, 2);
  await s.advance(120000); assert.equal(s.counts().requests, 2);
  s.loop.stop();
});

test('request progress and waiting reasons are surfaced instead of a silent empty view', async () => {
  let canSample = false;
  const s = session({ canSample: () => canSample, waitingMessage: () => '镜头移动中，停稳后立即分析',
    analyze: async (_sample, _signal, progress) => { progress('返回格式不符合协议，正在重试（1/1）'); return advice; },
  });
  s.loop.start(); await s.advance(350);
  assert.match(s.statuses.at(-1).message, /镜头移动中/);
  canSample = true; await s.advance(250);
  assert.ok(s.statuses.some(value => value.message.includes('重试')));
  assert.ok(s.statuses.some(value => value.phase === 'ready'));
  s.loop.stop();
});

test('moving/changing settings invalidates an in-flight response even if abort is ignored', async () => {
  const pending = deferred(); let signal;
  const s = session({ analyze: async (_sample, requestSignal) => { signal = requestSignal; return pending.promise; } });
  s.loop.start(); await s.advance(1000);
  s.loop.invalidate('镜头切换');
  assert.equal(signal.aborted, true);
  pending.resolve(advice); await flush();
  assert.equal(s.results.filter(Boolean).length, 0);
  s.loop.stop();
});

test('shutdown/background discards pending results and cannot restart itself', async () => {
  const pending = deferred();
  const s = session({ analyze: () => pending.promise });
  s.loop.start(); await s.advance(1000); s.loop.stop();
  pending.resolve(advice); await flush(); await s.advance(60000);
  assert.equal(s.results.filter(Boolean).length, 0);
  assert.equal(s.counts().samples, 1);
});

test('stale network results are rejected, local plans persist, and unready cameras never sample', async () => {
  const pending = deferred(); const s = session({ analyze: () => pending.promise });
  s.loop.start(); await s.advance(350); await s.advance(61000); pending.resolve(advice); await flush();
  assert.equal(s.results.filter(Boolean).length, 0); assert.equal(s.counts().timers, 0); s.loop.stop();
  const waiting = session({ canSample: () => false }); waiting.loop.start(); await waiting.advance(5000);
  assert.equal(waiting.counts().samples, 0); waiting.loop.stop();
  const plan = session(); plan.loop.start(); await plan.advance(350); await plan.advance(120000);
  assert.ok(plan.results.at(-1)); assert.equal(plan.counts().requests, 1); plan.loop.stop();
});

test('errors never retry in the background; explicit replan retries and fatal errors stop', async () => {
  let requests = 0;
  const s = session({ analyze: async () => { requests++; throw new Error('offline'); } });
  s.loop.start(); await s.advance(350); await s.advance(120000);
  assert.equal(requests, 1); assert.equal(s.counts().timers, 0);
  s.loop.invalidate(); await s.advance(350); assert.equal(requests, 2); s.loop.stop();
  const fatal = session({ analyze: async () => { throw Object.assign(new Error('invalid key'), { fatal: true }); } });
  fatal.loop.start(); await fatal.advance(350); assert.equal(fatal.counts().fatals, 1); assert.equal(fatal.counts().timers, 0);
});

test('shutter waits for a sample and cancelled queued samples never take a photo', async () => {
  const { CameraShotQueue } = loadModule('src/lib/guidanceRules.ts');
  const queue = new CameraShotQueue(); const pending = deferred(); const order = [];
  const sampling = queue.run(async () => { order.push('sample'); await pending.promise; });
  const controller = new AbortController();
  const obsolete = queue.run(async () => { order.push('obsolete'); }, controller.signal);
  const obsoleteCheck = assert.rejects(obsolete, /取消/);
  const shutter = queue.run(async () => { order.push('shutter'); });
  await flush(); assert.deepEqual(order, ['sample']);
  controller.abort(); pending.resolve(); await sampling; await obsoleteCheck; await shutter;
  assert.deepEqual(order, ['sample', 'shutter']);
});

test('samples resize to 768, preserve orientation and clean temporary files after success or cancel', async () => {
  const removed = []; let options; let actions;
  const { captureAnalysisSample } = loadModule('src/lib/cameraSample.ts', {
    'react-native': { Platform: { OS: 'android' } },
    'expo-image-manipulator': { SaveFormat: { JPEG: 'jpeg' }, manipulateAsync: async (_uri, ops) => { actions = ops; return { uri: 'file:///cache/small.jpg', base64: 'AA==' }; } },
    'expo-file-system': { cacheDirectory: 'file:///cache/', deleteAsync: async uri => removed.push(uri) },
  });
  const camera = { takePictureAsync: async opts => { options = opts; return { uri: 'file:///cache/sample.jpg', width: 3000, height: 4000 }; } };
  const queue = { run: async task => task() };
  const sample = await captureAnalysisSample(camera, queue, new AbortController().signal);
  assert.equal(sample.dataUrl, 'data:image/jpeg;base64,AA==');
  assert.equal(actions[1].resize.height, 768); assert.equal(options.skipProcessing, false); assert.equal(options.shutterSound, false);
  assert.equal(removed.length, 2);
  const controller = new AbortController();
  camera.takePictureAsync = async () => { controller.abort(); return { uri: 'file:///cache/cancel.jpg', width: 3000, height: 4000 }; };
  await assert.rejects(captureAnalysisSample(camera, queue, controller.signal), /取消/);
  assert.ok(removed.includes('file:///cache/cancel.jpg'));
});

test('digital zoom crops the same centered portrait frame for previews and photos', () => {
  const { digitalZoomFactor, getPhotoCrop } = loadModule('src/lib/cameraGeometry.ts');
  assert.equal(digitalZoomFactor(0), 1);
  assert.equal(digitalZoomFactor(1), 4);
  const crop = getPhotoCrop(3000, 4000, 1 / 3);
  assert.equal(crop.width, 1500); assert.equal(crop.height, 2000);
  assert.equal(crop.originX, 750); assert.equal(crop.originY, 1000);
  const wide = getPhotoCrop(1920, 1080, 0);
  assert.equal(wide.width, 810); assert.equal(wide.height, 1080);
  assert.throws(() => getPhotoCrop(0, 0, 0));
});

test('camera viewport stays within safe-area bounds on phones and tablets regardless of zoom', () => {
  const { getCameraViewport } = loadModule('src/lib/cameraGeometry.ts');
  for (const [width, height, top, bottom] of [[390, 844, 47, 34], [360, 800, 28, 24], [1024, 768, 24, 20]]) {
    const view = getCameraViewport(width, height, top, bottom);
    assert.ok(view.top >= top);
    assert.ok(view.top + view.height <= height - bottom + 0.001);
    assert.ok(view.left >= 0);
    assert.ok(view.left + view.width <= width);
    assert.ok(Math.abs(view.width / view.height - 3 / 4) < 0.001);
    // The masks must cover the entire region above, below and beside the crop.
    const masks = width * view.top + width * (height - view.top - view.height) + 2 * view.left * view.height;
    assert.ok(Math.abs(masks + view.width * view.height - width * height) < 0.001);
  }
});

test('each mode sends only its photography prompt, with the shared JSON contract and real photo', async () => {
  let call;
  const { analyzeCameraSample } = loadModule('src/lib/aiGuidance.ts', {
    './aiClient': { requestAICompletion: async (...args) => { call = args; return { content: JSON.stringify(advice) }; } },
  });
  for (const mode of ['人像', '风景', '夜景']) {
    await analyzeCameraSample({ provider: 'kimi', apiKey: 'fake', baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k3' },
      { style: '奶杏', mode, facing: 'back', zoom: 0, flash: 'off' }, { dataUrl: 'data:image/jpeg;base64,AA==', capturedAt: 123 }, new AbortController().signal);
    const prompt = call[2][0].content;
    for (const candidate of ['人像', '风景', '夜景']) assert.equal(prompt.includes(`【当前模式：${candidate}】`), candidate === mode);
    assert.ok(prompt.includes(JSON.stringify(call[3].outputSchema.schema)), 'mode guidance must retain the exact runtime schema');
    assert.ok(prompt.includes('camera_guidance_v3'));
    assert.ok(call[2][1].content[0].text.includes(`拍摄模式：${mode}`));
    assert.ok(call[2][1].content[0].text.includes('奶杏'));
    assert.equal(call[2][1].content[1].image_url.url, 'data:image/jpeg;base64,AA==');
    assert.equal(call[3].timeoutMs, 45000); assert.equal(call[3].json, true);
    assert.equal(call[3].outputSchema.name, 'camera_guidance_v3');
  }
});

test('a 30-second vision result reaches guidance once; slow capture is rejected before upload', async () => {
  const pending = deferred();
  const s = session({ analyze: () => pending.promise });
  s.loop.start(); await s.advance(350); await s.advance(30000);
  pending.resolve(advice); await flush();
  assert.equal(s.results.filter(Boolean).length, 1);
  assert.equal(s.statuses.at(-1).phase, 'ready');
  await s.advance(120000); assert.equal(s.counts().samples, 1);
  s.loop.stop();
  const capture = deferred(); const stale = session({ sample: () => capture.promise });
  stale.loop.start(); await stale.advance(350); const capturedAt = stale.now();
  await stale.advance(11000); capture.resolve({ dataUrl: 'data:image/jpeg;base64,AA==', capturedAt }); await flush();
  assert.equal(stale.counts().requests, 0); assert.match(stale.statuses.at(-1).message, /取样耗时/);
  stale.loop.stop();
});

test('direction cues distinguish translation, tilt, distance, zoom and uncertain frames', () => {
  const { getDirectionCue } = loadModule('src/lib/guidanceDirection.ts');
  const diagonal = getDirectionCue({ ...advice, horizontal: 'left', vertical: 'raise' });
  assert.equal(diagonal.x, -1); assert.equal(diagonal.y, -1); assert.equal(diagonal.kind, 'move');
  const tilt = getDirectionCue({ ...advice, tilt: 'down' });
  assert.equal(tilt.kind, 'tilt'); assert.equal(tilt.y, 1); assert.match(tilt.label, /下俯/);
  assert.equal(getDirectionCue({ ...advice, distance: 'farther' }).kind, 'distance');
  assert.equal(getDirectionCue(advice).kind, 'zoom');
  assert.equal(getDirectionCue({ ...advice, zoom: 'hold' }).kind, 'hold');
  const uncertain = getDirectionCue({ ...advice, confidence: 0.2, horizontal: 'right' });
  assert.equal(uncertain.kind, 'uncertain'); assert.equal(uncertain.x, 0);
});

test('saved photos preserve original at 1x and apply the same digital crop at 2x', async () => {
  const removed = []; let actions;
  const { prepareCapturedPhoto } = loadModule('src/lib/cameraSample.ts', {
    'react-native': { Platform: { OS: 'android' } },
    'expo-image-manipulator': { SaveFormat: { JPEG: 'jpeg' }, manipulateAsync: async (_uri, ops) => { actions = ops; return { uri: 'file:///cache/final.jpg' }; } },
    'expo-file-system': { cacheDirectory: 'file:///cache/', deleteAsync: async uri => removed.push(uri) },
  });
  const picture = { uri: 'file:///cache/original.jpg', width: 3000, height: 4000 };
  assert.equal(await prepareCapturedPhoto(picture, 0), picture.uri);
  assert.equal(removed.length, 0);
  assert.equal(await prepareCapturedPhoto(picture, 1 / 3), 'file:///cache/final.jpg');
  assert.equal(actions[0].crop.width, 1500); assert.equal(actions[0].crop.height, 2000);
  assert.deepEqual(removed, [picture.uri]);
});
