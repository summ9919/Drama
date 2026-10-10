const test = require('node:test');
const assert = require('node:assert/strict');
const { loadModule } = require('./helpers/load-ts.cjs');
const camera = { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: null, flash: 'keep' };
const load = native => loadModule('src/lib/cameraTuning.ts', { 'expo-modules-core': { requireOptionalNativeModule: () => native } });

test('Expo Go and fixed-aperture cameras never advertise or fake manual controls', async () => {
  const tuning = load(null);
  const capabilities = await tuning.readCameraCapabilities('back');
  assert.equal(capabilities.native, false);
  await tuning.applyCameraTuning('back', camera, capabilities);
  for (const change of [{ aperture: 2.4 }, { contrast: 1.1 }, { whiteBalance: 'daylight' }]) {
    await assert.rejects(tuning.applyCameraTuning('back', { ...camera, ...change }, capabilities), /不支持/);
  }
  assert.throws(() => tuning.validateCameraTuning({ ...camera, aperture: 1.8 }, { ...capabilities, native: true, apertures: [1.8] }), /光圈/);
});

test('invalid device commands are rejected before any native write', async () => {
  let writes = 0;
  const tuning = load({ apply: async () => { writes++; } });
  const capabilities = { native: true, cameraId: '0', apertures: [1.5, 2.4], contrast: true, whiteBalance: ['auto'] };
  await assert.rejects(tuning.applyCameraTuning('back', { ...camera, contrast: 1.1, aperture: 4 }, capabilities));
  await assert.rejects(tuning.applyCameraTuning('back', { ...camera, whiteBalance: 'daylight' }, capabilities));
  assert.equal(writes, 0);
  await tuning.applyCameraTuning('back', { ...camera, aperture: 2.4, contrast: 1.1, whiteBalance: 'auto' }, capabilities);
  assert.equal(writes, 1);
});
