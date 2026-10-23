const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { loadModule } = require('./helpers/load-ts.cjs');
const { getAlbumImages } = loadModule('src/lib/album.ts');

test('album stays empty without captures and shows only unique captured/saved photos', () => {
  assert.equal(getAlbumImages(null, []).length, 0);
  const images = getAlbumImages('file:new.jpg', ['file:old.jpg', 'file:old.jpg']);
  assert.deepEqual(Array.from(images, image => image.uri), ['file:new.jpg', 'file:old.jpg']);
  assert.match(images[0].tag, /尚未保存/);
  assert.equal(getAlbumImages('file:old.jpg', ['file:old.jpg']).length, 1);
  assert.equal(getAlbumImages('file:old.jpg', ['file:old.jpg'])[0].tag, '已保存');
});

function mediaSession({ granted = true, fail = false, os = 'android' } = {}) {
  const calls = [];
  const media = loadModule('src/lib/media.ts', {
    'react-native': { Platform: { OS: os } },
    'expo-media-library': {
      requestPermissionsAsync: async () => ({ granted }),
      createAssetAsync: async uri => { calls.push(['asset', uri]); if (fail) throw new Error('disk full'); },
    },
    'expo-file-system': {
      documentDirectory: 'file:documents/',
      makeDirectoryAsync: async uri => calls.push(['directory', uri]),
      copyAsync: async options => calls.push(['copy', options.from, options.to]),
      deleteAsync: async uri => calls.push(['delete', uri]),
    },
  });
  return { ...media, calls };
}

test('save retains a durable copy and returns its URI for album persistence', async () => {
  const session = mediaSession();
  const result = await session.saveImageToLibrary('file:cache/photo.jpg');
  assert.equal(result.saved, true);
  assert.match(result.uri, /^file:documents\/captures\/.+\.jpg$/);
  assert.deepEqual(session.calls[1], ['copy', 'file:cache/photo.jpg', result.uri]);
  assert.deepEqual(session.calls[2], ['asset', result.uri]);
  const count = session.calls.length;
  assert.equal((await session.saveImageToLibrary(result.uri)).uri, result.uri);
  assert.equal(session.calls.length, count, 're-saving must not duplicate the photo');
});

test('permission denial creates no files; failed system save removes only its new copy', async () => {
  const denied = mediaSession({ granted: false });
  assert.equal((await denied.saveImageToLibrary('file:cache/photo.jpg')).saved, false);
  assert.equal(denied.calls.length, 0);
  const failed = mediaSession({ fail: true });
  await assert.rejects(failed.saveImageToLibrary('file:cache/photo.jpg'), /disk full/);
  assert.equal(failed.calls.at(-1)[0], 'delete');
  assert.equal(failed.calls.at(-1)[1], failed.calls[1][2]);
});

test('web capture data URLs are retained without calling native media APIs', async () => {
  const session = mediaSession({ os: 'web' });
  const uri = 'data:image/jpeg;base64,captured-photo';
  assert.equal((await session.saveImageToLibrary(uri)).uri, uri);
  assert.equal(session.calls.length, 0);
});

function reviewSession({ saved = true, persist = async () => {}, granted = true } = {}) {
  const calls = [];
  const state = { capturedUri: 'file:cache/photo.jpg',
    clearCapturedUri: () => { calls.push('clear'); state.capturedUri = null; },
    addSavedUri: async uri => { calls.push(['record', uri]); await persist(); },
  };
  const { default: CameraRoute } = loadModule('src/app/(tabs)/camera.tsx', {
    react: { default: React, useState: initial => [initial, () => {}], useRef: current => ({ current }) },
    'react-native': { Alert: { alert: (...args) => calls.push(['alert', ...args]) } },
    'expo-router': { useRouter: () => ({ push: path => calls.push(['push', path]) }) },
    '../../components/business/CameraHome': { CameraHome: 'Home' },
    '../../components/business/PhotoReview': { PhotoReview: 'Review' },
    '../../components/ui/Screen': { Screen: 'Screen' },
    '../../hooks/useCameraFlow': { useCameraFlow: () => ({ open: async () => { calls.push('open'); return granted; } }) },
    '../../lib/media': { saveImageToLibrary: async () => { calls.push('file'); return { saved, uri: 'file:documents/saved.jpg' }; } },
    '../../store/captureStore': { useCaptureStore: selector => selector(state) },
  });
  return { calls, state, review: CameraRoute().props.children };
}

test('save waits for the album record before clearing preview and continuing camera; rapid taps save once', async () => {
  let finish;
  const session = reviewSession({ persist: () => new Promise(resolve => { finish = resolve; }) });
  const saving = session.review.props.onSave();
  await Promise.resolve(); await Promise.resolve();
  await session.review.props.onSave();
  await session.review.props.onRetake();
  assert.deepEqual(session.calls, ['file', ['record', 'file:documents/saved.jpg']]);
  assert.equal(session.state.capturedUri, 'file:cache/photo.jpg');
  finish(); await saving;
  assert.deepEqual(session.calls.slice(-3), ['clear', 'open', ['push', '/capture']]);
});

test('failed record writes keep preview and retry the durable file without saving a duplicate', async () => {
  let failures = 1;
  const session = reviewSession({ persist: async () => { if (failures--) throw new Error('storage full'); } });
  await session.review.props.onSave();
  assert.equal(session.state.capturedUri, 'file:cache/photo.jpg');
  assert.ok(!session.calls.includes('clear'));
  await session.review.props.onSave();
  assert.equal(session.calls.filter(call => call === 'file').length, 1);
  assert.deepEqual(session.calls.at(-1), ['push', '/capture']);
});

test('denied album permissions retain preview and do not continue camera', async () => {
  const session = reviewSession({ saved: false });
  await session.review.props.onSave();
  assert.equal(session.state.capturedUri, 'file:cache/photo.jpg');
  assert.equal(session.calls.filter(call => Array.isArray(call) && call[0] === 'record').length, 0);
  assert.ok(!session.calls.includes('open'));
});

test('capture store exposes completed persistence so saved images survive a fresh store instance', async () => {
  const { create } = require('zustand');
  const { persist, createJSONStorage } = require('zustand/middleware');
  let stored = null, complete;
  const mocks = { zustand: { create }, 'zustand/middleware': { persist, createJSONStorage },
    '../lib/capturePersistence': { capturePersistence: {
      getItem: async () => stored,
      setItem: (key, value) => new Promise(resolve => { complete = () => { stored = value; resolve(); }; }),
      removeItem: async () => {},
    } },
  };
  const first = loadModule('src/store/captureStore.ts', mocks).useCaptureStore;
  await first.persist.rehydrate();
  let committed = false;
  const saving = first.getState().addSavedUri('file:documents/photo.jpg').then(() => { committed = true; });
  await Promise.resolve();
  assert.equal(committed, false);
  complete(); await saving;
  const restored = loadModule('src/store/captureStore.ts', mocks).useCaptureStore;
  await restored.persist.rehydrate();
  assert.deepEqual(Array.from(restored.getState().savedUris), ['file:documents/photo.jpg']);
});

test('inspiration category buttons filter photos and preview never opens the camera', () => {
  const images = ['人像', '风景', '夜景'].flatMap(category => [1, 2, 3].map(index => ({
    category, title: `${category}${index}`, tag: category, source: { uri: `${category}${index}.jpg` },
  })));
  const slots = []; let cursor = 0; let cameraOpens = 0;
  const { InspirationPage } = loadModule('src/components/business/InspirationPage.tsx', {
    react: { default: React, useState: initial => {
      const slot = cursor++; if (!(slot in slots)) slots[slot] = initial;
      return [slots[slot], value => { slots[slot] = value; }];
    } },
    'react-native': { View: 'View', Text: 'Text', Image: 'Image', Pressable: 'Button', ScrollView: 'ScrollView', Modal: 'Modal',
      StyleSheet: { create: value => value, absoluteFillObject: {} }, Platform: { select: value => value.default } },
    'expo-linear-gradient': { LinearGradient: 'Gradient' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native-safe-area-context': { SafeAreaView: 'SafeArea' },
    '../../constants/data': { inspirationImages: images },
    '../ui/PageHeader': { PageHeader: 'Header' },
  });
  const nodes = tree => !React.isValidElement(tree) ? [] : [tree, ...React.Children.toArray(tree.props.children).flatMap(nodes)];
  const render = () => { cursor = 0; return nodes(InspirationPage({ onStartCamera: () => { cameraOpens++; } })); };
  const cards = tree => tree.filter(node => node.type === 'Button' && node.props.accessibilityLabel?.startsWith('预览'));
  assert.equal(cards(render()).length, 9);
  for (const category of ['人像', '风景', '夜景']) {
    render().find(node => node.type === 'Button' && nodes(node).some(child => child.type === 'Text' && child.props.children === category)).props.onPress();
    const filtered = cards(render());
    assert.equal(filtered.length, 3);
    assert.ok(filtered.every(node => node.props.accessibilityLabel.includes(category)));
    filtered[0].props.onPress();
    assert.equal(render().find(node => node.type === 'Modal').props.visible, true);
    render().find(node => node.props.accessibilityLabel === '关闭预览').props.onPress();
    assert.equal(render().find(node => node.type === 'Modal').props.visible, false);
    assert.equal(cards(render()).length, 3);
  }
  assert.equal(cameraOpens, 0);
});
