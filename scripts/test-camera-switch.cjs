const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { loadModule } = require('./helpers/load-ts.cjs');

const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const advice = { version: 3, route: { path: 'straight', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: null, flash: 'keep' }, state: 'aim', aimPoint: { x: 0.7, y: 0.3 }, readyToShoot: false, summary: '保持构图', horizontal: 'hold', vertical: 'hold', tilt: 'hold', distance: 'hold', zoom: 'hold', light: '柔和光线', confidence: 0.9 };

// Explicit renders let tests deliver another tap before React commits state updates.
function session(overrides = {}) {
  const slots = [], pendingEffects = [], timers = new Map();
  let cursor = 0, clock = 0, timerId = 0, onAppState, onGyro, shots = 0, delivered = 0;
  const react = {
    useRef(value) {
      const index = cursor++;
      return slots[index] ??= { current: value };
    },
    useState(value) {
      const index = cursor++;
      const slot = slots[index] ??= { value };
      return [slot.value, next => { slot.value = typeof next === 'function' ? next(slot.value) : next; }];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
      const slot = slots[index] = { deps, cleanup: previous?.cleanup };
      pendingEffects.push(() => { slot.cleanup?.(); slot.cleanup = effect(); });
    },
  };
  const schedule = (callback, delay) => {
    timers.set(++timerId, { callback, at: clock + delay });
    return timerId;
  };
  const sensors = { isAvailableAsync: async () => false };
  const { useCameraGuidance } = loadModule('src/hooks/useCameraGuidance.ts', {
    react,
    'expo-modules-core': { requireOptionalNativeModule: () => overrides.tuning ?? null },
    'react-native': {
      Platform: { OS: 'android' },
      AppState: { currentState: 'active', addEventListener: (_event, callback) => {
        onAppState = callback; return { remove() {} };
      } },
      Dimensions: { addEventListener: () => ({ remove() {} }) },
    },
    'expo-sensors': { Accelerometer: sensors, Gyroscope: overrides.gyro ? {
      isAvailableAsync: async () => true, setUpdateInterval() {},
      addListener(callback) { onGyro = callback; return { remove() { onGyro = null; } }; },
    } : sensors },
    '../lib/aiConfig': { getActiveAIConfig: async () => ({}) },
    '../lib/aiClient': { validateAIProfile() {} },
    '../lib/aiGuidance': { analyzeCameraSample: overrides.analyze ?? (async () => advice) },
    '../lib/cameraSample': {
      captureAnalysisSample: overrides.sample ?? (async () => ({ dataUrl: 'data:image/jpeg;base64,AA==', capturedAt: clock })),
      prepareCapturedPhoto: async picture => picture.uri,
      removeSampleFile: async () => {},
    },
  }, {
    Date: class extends Date { static now() { return clock; } },
    setTimeout: schedule, clearTimeout: id => timers.delete(id),
    setInterval() { throw new Error('Unexpected auto zoom'); }, clearInterval() {},
  });
  const cameraRef = { current: { takePictureAsync: async () => {
    shots++; return overrides.picture ? overrides.picture() : { uri: 'file:///photo.jpg' };
  } } };
  const render = () => {
    cursor = 0;
    const guide = useCameraGuidance(cameraRef, () => delivered++);
    pendingEffects.splice(0).forEach(effect => effect());
    return guide;
  };
  render();
  return {
    render, background: () => onAppState('background'), foreground: () => onAppState('active'),
    rotate: rotation => onGyro?.(rotation),
    shots: () => shots, delivered: () => delivered, timers: () => timers.size,
    unmount() { slots.forEach(slot => slot.cleanup?.()); },
    async advance(ms) {
      const target = clock + ms;
      for (let count = 0; count < 1000; count++) {
        const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        timers.delete(next[0]); clock = next[1].at; next[1].callback(); await flush();
      }
      clock = target; await flush();
    },
  };
}

test('switch waits for readiness and ignores rapid taps and shutter before the next render', async () => {
  const s = session();
  const initial = s.render();
  initial.flipCamera();
  assert.equal(s.render().context.facing, 'back');
  initial.cameraReady();
  const ready = s.render();
  ready.flipCamera();
  ready.flipCamera();
  await ready.capture();
  assert.equal(s.render().context.facing, 'front');
  assert.equal(s.render().ready, false);
  assert.equal(s.render().switching, true);
  assert.equal(s.shots(), 0);
  assert.equal(s.timers(), 1);
  s.render().cameraReady();
  assert.equal(s.render().switching, false);
  assert.equal(s.timers(), 0);
  await s.render().capture();
  assert.equal(s.shots(), 1);
  assert.equal(s.delivered(), 1);
  s.render().flipCamera();
  assert.equal(s.render().context.facing, 'back');
  s.unmount();
});

test('an in-flight AI sample blocks even an old switch handler, and releases after failure', async () => {
  const sample = deferred();
  const s = session({ sample: () => sample.promise });
  s.render().cameraReady();
  const old = s.render();
  await old.toggleGuidance();
  await s.advance(1000);
  assert.equal(s.render().sampling, true);
  old.flipCamera();
  assert.equal(s.render().context.facing, 'back');
  sample.reject(new Error('capture failed'));
  await flush();
  assert.equal(s.render().sampling, false);
  old.flipCamera();
  assert.equal(s.render().context.facing, 'front');
  s.unmount();
});

test('a pending shutter blocks switching until photo processing finishes', async () => {
  const picture = deferred();
  const s = session({ picture: () => picture.promise });
  s.render().cameraReady();
  const ready = s.render();
  const capture = ready.capture();
  ready.flipCamera();
  assert.equal(s.render().context.facing, 'back');
  picture.resolve({ uri: 'file:///photo.jpg' });
  await capture;
  assert.equal(s.delivered(), 1);
  assert.equal(s.render().capturing, false);
  s.unmount();
});

test('switch aborts old AI advice and only samples the new lens after readiness', async () => {
  const oldResponse = deferred();
  const requests = [];
  let samples = 0;
  const s = session({
    sample: async () => { samples++; return { dataUrl: 'data:image/jpeg;base64,AA==', capturedAt: 0 }; },
    analyze: (_config, context, _sample, signal) => {
      requests.push({ facing: context.facing, signal });
      return requests.length === 1 ? oldResponse.promise : Promise.resolve(advice);
    },
  });
  s.render().cameraReady();
  await s.render().toggleGuidance();
  await s.advance(1000);
  assert.equal(requests[0].facing, 'back');
  s.render().flipCamera();
  assert.equal(requests[0].signal.aborted, true);
  oldResponse.resolve(advice);
  await flush();
  assert.equal(s.render().result, null);
  await s.advance(2000);
  assert.equal(samples, 1);
  s.render().cameraReady();
  await s.advance(1000);
  assert.equal(samples, 2);
  assert.equal(requests[1].facing, 'front');
  assert.ok(s.render().result);
  s.unmount();
});

test('native failure or missing ready event exits the switching indicator and pauses AI', async () => {
  for (const timeout of [false, true]) {
    const s = session();
    s.render().cameraReady();
    await s.render().toggleGuidance();
    s.render().flipCamera();
    if (timeout) await s.advance(10000);
    else s.render().cameraError();
    const failed = s.render();
    assert.equal(failed.switching, false);
    assert.equal(failed.ready, false);
    assert.equal(failed.enabled, false);
    assert.equal(failed.status.phase, 'error');
    assert.match(failed.status.message, /退出取景器后重试/);
    assert.equal(s.timers(), 0);
    s.unmount();
  }
});

test('background and unmount cancel switch timers and ignore late native callbacks', async () => {
  const s = session();
  s.render().cameraReady();
  s.render().flipCamera();
  s.background();
  s.render().cameraReady();
  assert.equal(s.render().ready, false);
  assert.equal(s.render().switching, false);
  assert.equal(s.timers(), 0);
  await s.advance(10000);
  assert.notEqual(s.render().status.phase, 'error');
  s.foreground();
  s.render().flipCamera();
  assert.equal(s.render().context.facing, 'front');
  s.render().cameraReady();
  s.render().flipCamera();
  assert.equal(s.render().context.facing, 'back');
  const last = s.render();
  s.unmount();
  last.cameraReady();
  last.cameraError();
  assert.equal(s.timers(), 0);
});

test('front/back renders preserve CameraView identity and disable controls during transition', () => {
  let guide = {
    active: true, ready: true, context: { facing: 'back', zoom: 0 },
    status: { phase: 'off' },
  };
  const { CameraCapture } = loadModule('src/components/business/CameraCapture.tsx', {
    react: { default: React, useState: value => [typeof value === 'object' ? { width: 400, height: 800 } : value, () => {}] },
    'react-native': { ActivityIndicator: 'Spinner', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', StyleSheet: { create: value => value } },
    'expo-camera': { CameraView: 'NativeCamera' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'expo-linear-gradient': { LinearGradient: 'Gradient' },
    'react-native-safe-area-context': { SafeAreaView: 'SafeArea', useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    '../../constants/theme': { colors: {} },
    '../../constants/guidance': { CAMERA_STYLES: {} },
    '../../hooks/useCameraGuidance': { useCameraGuidance: () => guide },
    './CameraGuidanceControls': { CameraGuidanceControls: 'GuidanceControls' },
    './CameraDirectionOverlay': { CameraDirectionOverlay: 'DirectionOverlay' },
    './CameraReadyEffects': { CameraReadyFrame: 'ReadyFrame', CameraReadyNotice: 'ReadyNotice', CameraShutterHalo: 'ShutterHalo' },
  });
  function find(node, predicate, ancestors = []) {
    if (!React.isValidElement(node)) return null;
    const path = [...ancestors, { type: node.type, key: node.key }];
    if (predicate(node)) return { node, path };
    for (const child of React.Children.toArray(node.props.children)) {
      const found = find(child, predicate, path);
      if (found) return found;
    }
    return null;
  }
  const props = { cameraRef: { current: null } };
  const backTree = CameraCapture(props);
  const back = find(backTree, node => node.type === 'NativeCamera');
  guide = { ...guide, ready: false, switching: true, context: { facing: 'front', zoom: 0 } };
  const frontTree = CameraCapture(props);
  const front = find(frontTree, node => node.type === 'NativeCamera');
  assert.deepEqual(back.path, front.path, 'changing lens must not remount the camera or its ancestors');
  assert.equal(front.node.props.facing, 'front');
  assert.equal(back.node.ref, front.node.ref);
  const viewport = find(frontTree, node => node.props.testID === 'camera-viewport');
  assert.equal(find(viewport.node, node => ['Text', 'Pressable', 'Gradient'].includes(node.type)), null, 'no captions, buttons or gradient inside the preview');
  assert.ok(find(viewport.node, node => node.type === 'DirectionOverlay'));
  for (const label of ['切换前后镜头', '拍照']) {
    assert.equal(find(frontTree, node => node.props.accessibilityLabel === label).node.props.disabled, true);
  }
});

test('ready advice settles locally and movement revokes the ready effect', async () => {
  const s = session({ gyro: true, analyze: async () => ({ ...advice, state: 'ready', aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true }) });
  s.render().cameraReady();
  await s.render().toggleGuidance();
  s.render(); await flush();
  await s.advance(1200);
  assert.equal(s.render().target.phase, 'ready');
  s.rotate({ x: 0, y: 0, z: 0 });
  await s.advance(50);
  s.rotate({ x: 0, y: 0.1, z: 0 });
  assert.equal(s.render().target.phase, 'verifying');
  s.render().manualZoom(0.1);
  assert.notEqual(s.render().executionPhase, 'ready');
  s.unmount();
});

test('composition target persists while adjusting, and clears on lens switch or background', async () => {
  for (const action of ['expire', 'flip', 'background']) {
    let requests = 0;
    const pending = deferred();
    const s = session({ analyze: () => ++requests === 1
      ? Promise.resolve({ ...advice, aimPoint: { x: 0.7, y: 0.3 }, readyToShoot: false }) : pending.promise });
    s.render().cameraReady();
    await s.render().toggleGuidance();
    await s.advance(1000);
    assert.equal(s.render().target.phase, 'aiming');
    if (action === 'expire') await s.advance(8000);
    if (action === 'flip') s.render().flipCamera();
    if (action === 'background') s.background();
    if (action === 'expire') assert.ok(s.render().target);
    else assert.equal(s.render().target, null);
    s.unmount();
    pending.resolve(advice); await flush();
    assert.equal(s.timers(), 0);
  }
});

test('continuous light hand tremor does not starve sampling or abort a slow valid response', async () => {
  const response = deferred();
  let signal, requests = 0;
  const s = session({ gyro: true, analyze: (_config, _context, _sample, requestSignal) => {
    signal = requestSignal; requests++; return response.promise;
  } });
  s.render().cameraReady();
  await s.render().toggleGuidance();
  s.render(); await flush();
  for (let index = 0; index < 100; index++) {
    await s.advance(50);
    s.rotate({ x: 0.02, y: index % 2 ? 0.05 : -0.05, z: 0 });
  }
  assert.equal(requests, 1);
  assert.equal(signal.aborted, false);
  response.resolve({ ...advice, aimPoint: { x: 0.65, y: 0.4 } });
  await flush();
  assert.equal(s.render().target.phase, 'aiming');
  assert.ok(s.render().result);
  s.unmount();
});

test('JSON camera changes animate once, then local readiness stops all model requests', async () => {
  const requests = [];
  const s = session({ analyze: async (_config, context) => {
    requests.push(context);
    return requests.length === 1
      ? { ...advice, state: 'adjust', aimPoint: null, zoom: 'in', route: { path: 'none', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: 1.15, flash: 'auto' } }
      : { ...advice, state: 'ready', aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true, route: { path: 'none', holdMs: 800 } };
  } });
  s.render().cameraReady(); await s.render().toggleGuidance(); await s.advance(350);
  assert.equal(requests.length, 1); assert.equal(s.render().context.flash, 'auto');
  assert.equal(s.render().adjustingZoom, true);
  await s.advance(600);
  assert.equal(requests.length, 1); assert.equal(s.render().adjustingZoom, false);
  assert.ok(Math.abs(s.render().context.zoom - 0.05) < 1e-6);
  await s.advance(799); assert.equal(requests.length, 1);
  await s.advance(351); assert.equal(requests.length, 1);
  assert.equal(s.render().executionPhase, 'ready');
  await s.advance(120000); assert.equal(requests.length, 1); assert.equal(s.timers(), 0);
  s.unmount();
});

test('aim and manual movement never request during adjustment; explicit confirmation completes locally', async () => {
  let requests = 0;
  const s = session({ analyze: async () => { requests++; return advice; } });
  s.render().cameraReady(); await s.render().toggleGuidance(); await s.advance(350);
  await s.advance(120000); assert.equal(requests, 1);
  assert.ok(s.render().target); assert.equal(s.render().executionPhase, 'manual');
  s.render().confirmAdjustment(); s.render().confirmAdjustment();
  await s.advance(799); assert.equal(requests, 1);
  await s.advance(351); assert.equal(requests, 1);
  await s.advance(120000); assert.equal(requests, 1);
  s.unmount();
});

test('sensor-guided alignment completes locally after dwell, then ready has no request timers', async () => {
  let requests = 0;
  const s = session({ gyro: true, analyze: async () => ++requests === 1
    ? { ...advice, aimPoint: { x: 0.65, y: 0.5 } }
    : { ...advice, state: 'ready', aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true, route: { path: 'none', holdMs: 800 } } });
  s.render().cameraReady(); await s.render().toggleGuidance(); s.render(); await flush();
  await s.advance(350); assert.equal(s.render().executionPhase, 'moving');
  s.rotate({ x: 0, y: 0, z: 0 });
  for (let i = 0; i < 8; i++) { await s.advance(50); s.rotate({ x: 0, y: -0.4, z: 0 }); }
  assert.equal(requests, 1); assert.equal(s.render().executionPhase, 'settling');
  await s.advance(799); assert.equal(requests, 1);
  await s.advance(501); assert.equal(requests, 1); assert.equal(s.render().executionPhase, 'ready');
  await s.advance(300000); assert.equal(requests, 1); assert.equal(s.timers(), 0);
  s.unmount();
});

test('turning guidance off during automatic adjustment cancels local work and prevents review', async () => {
  let requests = 0;
  const s = session({ analyze: async () => { requests++; return { ...advice, state: 'adjust', aimPoint: null, route: { path: 'none', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: 1.15, flash: 'keep' } }; } });
  s.render().cameraReady(); await s.render().toggleGuidance(); await s.advance(500);
  assert.equal(s.render().adjustingZoom, true);
  await s.render().toggleGuidance(); const zoom = s.render().context.zoom;
  await s.advance(120000); assert.equal(requests, 1); assert.equal(s.timers(), 0);
  assert.equal(s.render().context.zoom, zoom); assert.equal(s.render().target, null);
  s.unmount();
});

test('manual zoom buttons reach a target between increments before local completion', async () => {
  let requests = 0;
  const s = session({ analyze: async () => ++requests === 1
    ? { ...advice, state: 'adjust', aimPoint: null, route: { path: 'none', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: 1.2, flash: 'keep' } }
    : { ...advice, state: 'ready', aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true, route: { path: 'none', holdMs: 800 } } });
  s.render().cameraReady(); s.render().toggleAutoZoom();
  await s.render().toggleGuidance(); await s.advance(350);
  assert.equal(s.render().executionPhase, 'parameters');
  for (let i = 0; i < 2; i++) s.render().manualZoom(s.render().context.zoom + 0.025);
  await s.advance(120000); assert.equal(requests, 1);
  s.render().manualZoom(s.render().context.zoom + 0.025);
  assert.ok(Math.abs(1 + 3 * s.render().context.zoom - 1.2) < 1e-6);
  assert.equal(s.render().executionPhase, 'settling');
  await s.advance(799); assert.equal(requests, 1);
  await s.advance(351); assert.equal(requests, 1);
  await s.advance(120000); assert.equal(requests, 1);
  s.unmount();
});

test('native tuning gates the ready effect, sends device capabilities, and never triggers a second model call', async () => {
  const pending = deferred(); let requests = 0, commands;
  const capabilities = { native: true, cameraId: 'back-test', apertures: [1.5, 2.4], contrast: true, whiteBalance: ['auto', 'daylight'] };
  const s = session({ gyro: true, tuning: {
    reset: async () => {}, capabilities: async () => capabilities,
    apply: (...args) => { commands = args; return pending.promise; },
  }, analyze: async (_config, context) => {
    requests++; assert.equal(context.capabilities.cameraId, 'back-test');
    return { ...advice, aimPoint: { x: 0.5, y: 0.5 }, camera: { zoomFactor: null, flash: 'keep', aperture: 2.4, contrast: 1.05, whiteBalance: 'daylight' } };
  } });
  s.render().cameraReady(); await s.render().toggleGuidance(); s.render(); await flush(); await s.advance(350);
  assert.equal(s.render().executionPhase, 'parameters');
  assert.deepEqual(commands, ['back', 'back-test', 2.4, 1.05, 'daylight']);
  await s.advance(1000); assert.notEqual(s.render().executionPhase, 'ready');
  pending.resolve(); await flush();
  await s.advance(799); assert.notEqual(s.render().executionPhase, 'ready');
  await s.advance(101); assert.equal(s.render().executionPhase, 'ready');
  assert.match(s.render().tuningMessage, /2.4/);
  await s.advance(300000); assert.equal(requests, 1); assert.equal(s.timers(), 0);
  s.unmount();
});

test('native failure or cancellation never produces a late ready effect', async () => {
  for (const outcome of ['failure', 'off', 'timeout']) {
    const pending = deferred(); let requests = 0;
    const s = session({ gyro: true, tuning: {
      reset: async () => {}, capabilities: async () => ({ native: true, cameraId: '0', apertures: [], contrast: true, whiteBalance: ['auto'] }),
      apply: () => pending.promise,
    }, analyze: async () => { requests++; return { ...advice, aimPoint: { x: 0.5, y: 0.5 }, camera: { ...advice.camera, contrast: 1.1 } }; } });
    s.render().cameraReady(); await s.render().toggleGuidance(); s.render(); await flush(); await s.advance(350);
    assert.equal(s.render().executionPhase, 'parameters');
    if (outcome === 'off') { await s.render().toggleGuidance(); pending.resolve(); }
    else if (outcome === 'failure') pending.reject(new Error('unsupported hardware'));
    else await s.advance(5000);
    await flush(); await s.advance(10000);
    assert.notEqual(s.render().executionPhase, 'ready'); assert.equal(requests, 1);
    if (outcome !== 'off') assert.equal(s.render().status.phase, 'error');
    s.unmount(); pending.resolve(); await flush(); assert.equal(s.timers(), 0);
  }
});
