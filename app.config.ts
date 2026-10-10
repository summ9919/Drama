import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Drama相机',
  slug: 'warm-lens',
  scheme: 'warm-lens',
  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-sensors', { motionPermission: '允许Drama相机检测手机移动，以及时更新拍摄建议。' }],
    ['expo-camera', { cameraPermission: '允许Drama相机使用相机，实时给你温柔的构图提示。' }],
    ['expo-media-library', {
      photosPermission: '允许Drama相机读取你的相册。',
      savePhotosPermission: '允许Drama相机保存照片到相册。',
    }],
  ],
});
