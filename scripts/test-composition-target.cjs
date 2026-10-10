const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { loadModule } = require('./helpers/load-ts.cjs');
const { parseGuidance } = loadModule('src/lib/guidanceRules.ts');
const { targetFromResult, moveCompositionTarget } = loadModule('src/lib/compositionTarget.ts');
const { getCompositionMessage } = loadModule('src/lib/compositionMessage.ts');
const advice = { version: 3, route: { path: 'none', holdMs: 800 }, camera: { aperture: null, contrast: null, whiteBalance: 'keep', zoomFactor: null, flash: 'keep' }, state: 'ready', summary: '构图自然', light: '柔和', horizontal: 'hold', vertical: 'hold', tilt: 'hold', distance: 'hold', zoom: 'hold', confidence: 0.9, aimPoint: { x: 0.5, y: 0.5 }, readyToShoot: true };
const result = changes => ({ advice: { ...advice, ...changes }, capturedAt: 1000, receivedAt: 1100 });

test('validates image-space endpoints and explicit completion from the model', () => {
  for (const aimPoint of [{ x: -0.1, y: 0.5 }, { x: 0.5, y: 1.01 }, { x: '0.5', y: 0.5 }, {}, 1, []]) {
    assert.throws(() => parseGuidance(JSON.stringify({ ...advice, aimPoint })));
  }
  assert.throws(() => parseGuidance(JSON.stringify({ ...advice, readyToShoot: 'yes' })));
  assert.throws(() => parseGuidance(JSON.stringify({ ...advice, confidence: 0.4 })));
  const low = parseGuidance(JSON.stringify({ ...advice, state: 'uncertain', aimPoint: null, readyToShoot: false, confidence: 0.4 }));
  assert.equal(low.aimPoint, null);
  assert.equal(low.readyToShoot, false);
  assert.throws(() => parseGuidance(JSON.stringify({ ...advice, distance: 'closer' })));
});

test('completion requires fresh high-confidence explicit confirmation, centered aim, and no remaining action', () => {
  assert.equal(targetFromResult(result(), 1100).phase, 'ready');
  for (const changes of [{ readyToShoot: false }, { readyToShoot: undefined }, { confidence: 0.79 }]) {
    assert.equal(targetFromResult(result(changes), 1100).phase, 'verifying');
  }
  assert.equal(targetFromResult(result({ aimPoint: { x: 0.8, y: 0.2 } }), 1100).phase, 'aiming');
  for (const changes of [{ aimPoint: null }, { confidence: 0.5 }, { zoom: 'out' }, { horizontal: 'left' }]) {
    assert.equal(targetFromResult(result(changes), 1100), null);
  }
  assert.equal(targetFromResult(result(), 31000).phase, 'ready');
  assert.equal(targetFromResult(result(), 61000), null);
  assert.equal(targetFromResult(result(), 500), null);
});

test('phone rotation moves the endpoint toward the fixed center; no timer-driven auto completion', () => {
  let target = { x: 0.6, y: 0.5, phase: 'aiming' };
  const unchanged = moveCompositionTarget(target, { x: 0, y: 0, z: 0 }, 0.05, 'back', 1);
  assert.equal(unchanged, target);
  for (let i = 0; i < 6; i++) target = moveCompositionTarget(target, { x: 0, y: -0.3, z: 0 }, 0.05, 'back', 1);
  assert.ok(target.x < 0.6);
  assert.equal(target.phase, 'verifying');
  assert.equal(moveCompositionTarget(targetFromResult(result(), 1100), { x: 0.1, y: 0, z: 0 }, 0.05, 'back', 1).phase, 'verifying');
});

test('unmirrored front lens reverses pitch, preserves yaw; zoom changes gain; invalid samples are ignored', () => {
  const target = { x: 0.5, y: 0.5, phase: 'aiming' };
  const rate = { x: 0.2, y: 0.2, z: 0 };
  const back = moveCompositionTarget(target, rate, 0.1, 'back', 1);
  const front = moveCompositionTarget(target, rate, 0.1, 'front', 1);
  assert.ok(back.x > 0.5 && back.y > 0.5 && front.x > 0.5 && front.y < 0.5);
  assert.equal(back.x, front.x);
  assert.ok(moveCompositionTarget(target, rate, 0.1, 'back', 2).x > back.x);
  for (const dt of [0, -1, 1, NaN]) assert.equal(moveCompositionTarget(target, rate, dt, 'back', 1), target);
});

test('photo confirmation wording only appears for a confirmed target', () => {
  assert.equal(getCompositionMessage(true, { x: 0.5, y: 0.5, phase: 'ready' }, result(), false, true), '可以拍照了');
  assert.doesNotMatch(getCompositionMessage(true, null, result(), false, true), /可以拍照/);
  assert.doesNotMatch(getCompositionMessage(true, { x: 0.5, y: 0.5, phase: 'verifying' }, result(), false, true), /可以拍照/);
  assert.doesNotMatch(getCompositionMessage(false, { x: 0.5, y: 0.5, phase: 'ready' }, result(), false, true), /可以拍照/);
});

test('viewport fits entirely between measured controls on small phones and tablets', () => {
  const { getCameraViewport } = loadModule('src/lib/cameraGeometry.ts');
  for (const [width, height] of [[320, 568], [360, 640], [412, 915], [768, 1024]]) {
    for (const controls of [250, 330, Math.round(height * 0.44)]) {
      const top = 28 + 82, bottom = 24 + controls;
      const viewport = getCameraViewport(width, height, top, bottom);
      assert.ok(viewport.top >= top);
      assert.ok(viewport.top + viewport.height <= height - bottom + 0.001);
      assert.ok(Math.abs(viewport.width / viewport.height - 0.75) < 0.001);
    }
  }
});

test('overlay uses the exact preview center and contains no frame, text, buttons or filled target', () => {
  const { CameraDirectionOverlay } = loadModule('src/components/business/CameraDirectionOverlay.tsx', {
    react: { default: React }, 'react-native': { View: 'View', StyleSheet: { create: x => x, absoluteFill: {} } },
  });
  function flatten(node) {
    if (!React.isValidElement(node)) return [];
    return [node, ...React.Children.toArray(node.props.children).flatMap(flatten)];
  }
  const nodes = flatten(CameraDirectionOverlay({ enabled: true, target: { x: 0.7, y: 0.3, phase: 'aiming' }, width: 360, height: 480 }));
  const dot = nodes.find(node => node.props.testID === 'composition-center');
  const ring = nodes.find(node => node.props.testID === 'composition-target');
  const dotStyle = Object.assign({}, ...dot.props.style);
  const ringStyle = Object.assign({}, ...ring.props.style);
  assert.equal(dotStyle.left + dotStyle.width / 2, 180);
  assert.equal(dotStyle.top + dotStyle.height / 2, 240);
  assert.equal(ringStyle.backgroundColor, undefined);
  assert.ok(Math.abs(ringStyle.left + ringStyle.width / 2 - 252) < 0.001);
  assert.ok(nodes.every(node => node.type === 'View' || node.type === React.Fragment));
});
