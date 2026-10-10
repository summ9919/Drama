const test = require('node:test');
const assert = require('node:assert/strict');
const { loadModule } = require('./helpers/load-ts.cjs');
const { GuidanceExecution } = loadModule('src/lib/guidanceExecution.ts');
const { parseGuidance } = loadModule('src/lib/guidanceRules.ts');
const { GUIDANCE_EXAMPLE } = loadModule('src/constants/guidanceProtocol.ts');
const context = { mode: '人像', style: '清透', facing: 'back', zoom: 0, flash: 'off' };
function result(changes = {}) {
  return { advice: parseGuidance(JSON.stringify({ ...GUIDANCE_EXAMPLE, ...changes })), capturedAt: 0, receivedAt: 0 };
}
function parameterPlan(camera) {
  return result({ state: 'adjust', aimPoint: null, route: { path: 'none', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', ...camera } });
}

test('a route waits indefinitely for alignment, then requires 800ms stable and marks ready locally', () => {
  const execution = new GuidanceExecution(); execution.setSensors(true);
  execution.load(result({ aimPoint: { x: 0.65, y: 0.5 } }), context, 0, true);
  assert.equal(execution.phase, 'moving');
  assert.equal(execution.finishIfStable(120000), false);
  for (let i = 1; i <= 8; i++) execution.rotate({ x: 0, y: -0.4, z: 0 }, 0.05, 'back', 120000 + i * 50);
  assert.equal(execution.phase, 'settling');
  assert.equal(execution.finishIfStable(120400), false);
  assert.equal(execution.finishIfStable(121199), false);
  assert.equal(execution.finishIfStable(121200), true);
  assert.equal(execution.finishIfStable(999999), false);
  assert.equal(execution.phase, 'ready');
});

test('leaving the circle or renewed motion resets the stability dwell', () => {
  const execution = new GuidanceExecution(); execution.setSensors(true);
  execution.load(result({ aimPoint: { x: 0.55, y: 0.5 } }), context, 0, true);
  execution.rotate({ x: 0, y: -0.4, z: 0 }, 0.1, 'back', 100);
  assert.equal(execution.finishIfStable(100), false);
  execution.noteMotion(700);
  assert.equal(execution.finishIfStable(700), false);
  assert.equal(execution.finishIfStable(1000), false);
  assert.equal(execution.finishIfStable(1500), true);
});

test('explicit JSON camera parameters execute once; local readiness waits for actual local values and settling', () => {
  const execution = new GuidanceExecution();
  const commands = execution.load(parameterPlan({ zoomFactor: 1.15, flash: 'auto' }), context, 0, true);
  assert.ok(Math.abs(commands.zoom - 0.05) < 1e-6); assert.equal(commands.flash, 'auto');
  assert.equal(execution.phase, 'parameters'); assert.equal(execution.finishIfStable(10000), false);
  execution.observeCamera({ ...context, zoom: 0.05 }, 10100);
  assert.equal(execution.phase, 'parameters');
  execution.observeCamera({ ...context, zoom: 0.05, flash: 'auto' }, 10200);
  assert.equal(execution.phase, 'settling');
  assert.equal(execution.finishIfStable(10200), false); assert.equal(execution.finishIfStable(11000), true);
});

test('manual movement and missing sensors cannot complete locally just by waiting', () => {
  for (const plan of [result(), result({ state: 'adjust', aimPoint: null, horizontal: 'left', route: { path: 'none', holdMs: 800 } })]) {
    const execution = new GuidanceExecution(); execution.load(plan, context, 0, true);
    assert.equal(execution.phase, 'manual'); assert.equal(execution.finishIfStable(60000), false);
    assert.equal(execution.confirmManual(60000), true);
    assert.equal(execution.finishIfStable(60000), false); assert.equal(execution.finishIfStable(60800), true);
  }
});

test('disabled auto zoom requires manual parameter completion, and unsupported/oversized commands are rejected atomically', () => {
  const execution = new GuidanceExecution();
  const commands = execution.load(parameterPlan({ zoomFactor: 1.15, flash: 'keep' }), context, 0, false);
  assert.equal(commands.zoom, undefined); assert.equal(execution.phase, 'parameters');
  assert.equal(execution.confirmManual(2000), false);
  execution.observeCamera({ ...context, zoom: 0.05 }, 2100);
  assert.equal(execution.phase, 'settling');
  assert.throws(() => execution.load(parameterPlan({ zoomFactor: 1.9, flash: 'on' }), context, 0, true), /超过允许幅度/);
  assert.equal(execution.advice, null);
  assert.throws(() => execution.load(parameterPlan({ zoomFactor: null, flash: 'on' }), { ...context, facing: 'front' }, 0, true), /前置/);
  assert.equal(execution.advice, null);
  assert.throws(() => parseGuidance(JSON.stringify({ ...GUIDANCE_EXAMPLE, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: null, flash: 'keep', iso: 100 } })), /JSON 协议不匹配/);
});

test('ready and centered plans settle locally, and motion revokes readiness without network polling', () => {
  const execution = new GuidanceExecution(); execution.setSensors(true);
  execution.load(result({ state: 'ready', aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true, route: { path: 'none', holdMs: 800 } }), context, 0, true);
  assert.equal(execution.phase, 'settling'); assert.equal(execution.finishIfStable(0), false); assert.equal(execution.finishIfStable(800), true);
  execution.rotate({ x: 0.2, y: 0, z: 0 }, 0.05, 'back', 120001);
  assert.equal(execution.phase, 'settling'); assert.notEqual(execution.target.phase, 'ready');
  assert.equal(execution.finishIfStable(240000), false);
  execution.load(result({ aimPoint: { x: 0.5, y: 0.5 } }), context, 0, true);
  assert.equal(execution.phase, 'settling'); assert.equal(execution.finishIfStable(120000), false);
  execution.load(parameterPlan({ zoomFactor: 1, flash: 'off' }), context, 0, true);
  assert.equal(execution.phase, 'settling'); assert.equal(execution.finishIfStable(120000), false);
});

test('combined zoom and aim plan keeps route coordinates in the current digital crop', () => {
  const execution = new GuidanceExecution(); execution.setSensors(true);
  execution.load(result({ aimPoint: { x: 0.6, y: 0.4 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: 1.3, flash: 'keep' } }), context, 0, true);
  execution.observeCamera({ ...context, zoom: 0.1 }, 600);
  assert.ok(Math.abs(execution.target.x - 0.63) < 1e-6);
  assert.ok(Math.abs(execution.target.y - 0.37) < 1e-6);
  assert.equal(execution.phase, 'moving'); assert.equal(execution.finishIfStable(999999), false);
});

test('uncertain cannot be confirmed into a ready effect; hardware completion is mandatory', () => {
  const execution = new GuidanceExecution(); execution.setSensors(true);
  execution.load(result({ state: 'uncertain', aimPoint: null, route: { path: 'none', holdMs: 800 }, confidence: 0.2 }), context, 0, true);
  assert.equal(execution.phase, 'unavailable'); assert.equal(execution.confirmManual(1000), false);
  assert.equal(execution.finishIfStable(120000), false);
  execution.load(result({ aimPoint: { x: 0.5, y: 0.5 } }), context, 0, true);
  execution.setHardwareDone(false, 0); assert.equal(execution.phase, 'parameters');
  assert.equal(execution.finishIfStable(120000), false);
  execution.setHardwareDone(true, 120000);
  assert.equal(execution.finishIfStable(120000), false); assert.equal(execution.finishIfStable(120800), true);
  execution.rotate({ x: 0, y: 0.04, z: 0 }, 0.05, 'back', 120850);
  assert.equal(execution.phase, 'ready'); assert.equal(execution.target.phase, 'ready');
  execution.rotate({ x: 0, y: 0.8, z: 0 }, 0.2, 'back', 120900);
  assert.equal(execution.phase, 'moving'); assert.notEqual(execution.target.phase, 'ready');
  execution.rotate({ x: 0, y: -0.8, z: 0 }, 0.2, 'back', 121100);
  assert.equal(execution.finishIfStable(121100), false); assert.equal(execution.finishIfStable(121900), true);
});
