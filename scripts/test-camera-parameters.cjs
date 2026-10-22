const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { loadModule } = require('./helpers/load-ts.cjs');

function panelSession() {
  const slots = [];
  let cursor = 0;
  const react = { default: React,
    useState(initial) {
      const slot = slots[cursor++] ??= { value: initial };
      return [slot.value, next => { slot.value = typeof next === 'function' ? next(slot.value) : next; }];
    },
    useRef(initial) { return slots[cursor++] ??= { current: initial }; },
    useEffect(effect) { effect(); },
  };
  const module = loadModule('src/components/business/CameraParameterPanel.tsx', {
    react,
    'react-native': { View: 'View', Text: 'Text', Pressable: 'Button', Modal: 'Modal', ScrollView: 'ScrollView', ActivityIndicator: 'Spinner',
      StyleSheet: { create: x => x, absoluteFillObject: {} }, Platform: { select: x => x.default ?? x.web } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'expo-linear-gradient': { LinearGradient: 'Gradient' },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 20 }) },
  });
  return { ...module,
    render(props) { cursor = 0; module.CameraParameterPanel(props); cursor = 0; return module.CameraParameterPanel(props); },
  };
}
const nodes = tree => !React.isValidElement(tree) ? [] : [tree, ...React.Children.toArray(tree.props.children).flatMap(nodes)];
const caps = { native: true, cameraId: '0', apertures: [1.5, 2.4], whiteBalance: ['auto', 'daylight'], contrast: true };

test('each parameter tab commits the dragged value to the corresponding camera setting', () => {
  const p = panelSession(), changes = [];
  const props = { visible: true, context: { zoom: 0, flash: 'off', capabilities: caps },
    appliedTuning: null, disabled: false, busy: false, message: '系统自动色彩', onClose() {}, onChange: async change => { changes.push(change); } };
  for (const [label, value, field, expected] of [
    ['变焦', 150, 'zoom', 0.5], ['光圈', 1, 'aperture', 2.4],
    ['白平衡', 1, 'whiteBalance', 'daylight'], ['对比度', 40, 'contrast', 1.2], ['闪光灯', 2, 'flash', 'on'],
  ]) {
    const tab = nodes(p.render(props)).find(node => node.type === 'Button' && nodes(node).some(child => child.type === 'Text' && child.props.children === label));
    tab.props.onPress();
    const wheel = nodes(p.render(props)).find(node => node.type === p.ParameterWheel);
    assert.equal(wheel.props.disabled, false);
    wheel.props.onChange(value);
    wheel.props.onCommit(value);
    assert.equal(changes.at(-1)[field], expected);
  }
});

test('unsupported hardware is disabled while zoom and flash remain adjustable', () => {
  const p = panelSession(); let changes = 0;
  const props = { visible: true, context: { zoom: 0, flash: 'off' }, appliedTuning: null,
    disabled: false, busy: false, message: '', onClose() {}, onChange: async () => { changes++; } };
  for (const label of ['光圈', '白平衡', '对比度', '变焦', '闪光灯']) {
    nodes(p.render(props)).find(node => node.type === 'Button' && nodes(node).some(child => child.type === 'Text' && child.props.children === label)).props.onPress();
    const wheel = nodes(p.render(props)).find(node => node.type === p.ParameterWheel);
    assert.equal(wheel.props.disabled, ['光圈', '白平衡', '对比度'].includes(label));
    if (wheel.props.disabled) wheel.props.onCommit(1);
  }
  assert.equal(changes, 0);
});

test('wheel uses relative motion without touch jumps, snaps to detents and clamps its range', () => {
  const p = panelSession(); const changes = [], commits = [];
  const tree = p.ParameterWheel({ value: 150, max: 300, disabled: false, label: '变焦滚轮', valueText: '2.50x', formatValue: String, onChange: value => changes.push(value), onCommit: value => commits.push(value) });
  const wheel = nodes(tree).find(node => node.props.accessibilityRole === 'adjustable');
  wheel.props.onResponderGrant({ nativeEvent: { pageX: 200 } });
  assert.deepEqual(changes, [], 'touching anywhere must not jump the value');
  wheel.props.onResponderMove({ nativeEvent: { pageX: 180 } });
  wheel.props.onResponderMove({ nativeEvent: { pageX: 176 } });
  assert.deepEqual(changes, [153], 'nearby motion should snap to one detent without duplicate updates');
  wheel.props.onResponderMove({ nativeEvent: { pageX: -3000 } });
  wheel.props.onResponderMove({ nativeEvent: { pageX: 4000 } });
  assert.deepEqual(changes, [153, 300, 0]);
  assert.deepEqual(commits, []);
  wheel.props.onResponderRelease();
  assert.deepEqual(commits, [0]);
});

test('wheel buttons and accessibility actions move exactly one detent; cancelled gestures do not apply', () => {
  const p = panelSession(); const changes = [], commits = [];
  const tree = p.ParameterWheel({ value: 1, max: 2, disabled: false, label: '闪光灯滚轮', valueText: '自动', formatValue: String, onChange: value => changes.push(value), onCommit: value => commits.push(value) });
  const wheel = nodes(tree).find(node => node.props.accessibilityRole === 'adjustable');
  nodes(tree).find(node => node.props.accessibilityLabel === '闪光灯滚轮增大一格').props.onPress();
  assert.equal(commits.at(-1), 2);
  wheel.props.onAccessibilityAction({ nativeEvent: { actionName: 'decrement' } });
  assert.equal(commits.at(-1), 0);
  wheel.props.onResponderGrant({ nativeEvent: { pageX: 200 } });
  wheel.props.onResponderMove({ nativeEvent: { pageX: 136 } });
  assert.equal(changes.at(-1), 2);
  wheel.props.onResponderTerminate();
  assert.equal(changes.at(-1), 1);
  assert.deepEqual(commits, [2, 0]);
});

test('unsupported wheels ignore gestures and single-step actions', () => {
  const p = panelSession(); const changes = [], commits = [];
  const tree = p.ParameterWheel({ value: 0, max: 0, disabled: true, label: '光圈滚轮', valueText: '自动', formatValue: String, onChange: x => changes.push(x), onCommit: x => commits.push(x) });
  const wheel = nodes(tree).find(node => node.props.accessibilityRole === 'adjustable');
  assert.equal(wheel.props.onStartShouldSetResponder(), false);
  wheel.props.onResponderMove({ nativeEvent: { pageX: -100 } });
  wheel.props.onResponderRelease();
  wheel.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
  assert.deepEqual(changes, []); assert.deepEqual(commits, []);
});
