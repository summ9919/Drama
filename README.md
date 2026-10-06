# Drama相机 · Drama Camera

一个基于 Expo Router + React Native 的暖色摄影引导 App 前端原型，面向 iOS 和 Android。

## 运行

```bash
npm install
npm start
```

## 构建 Android APK

本项目已包含 `eas.json` 的 APK 预览构建配置。安装 EAS CLI 并登录 Expo 后执行：

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

构建完成后，EAS 会返回 APK 下载地址。`preview` 配置适合直接安装到 Android 真机；发布应用商店时使用 `production` 生成 AAB。

扫码或使用模拟器打开后，可以从「相机」页申请权限并进入取景器。相机页的提示气泡、焦段、滤镜和参数是前端交互示例；后端 AI 接口可以在 `src/components/business/CameraCapture.tsx` 中接入真实的视觉分析服务。

## 目录

路由页面放在 `src/app`，四个 tab 页面分别是 `camera.tsx`、`inspiration.tsx`、`album.tsx` 和 `profile.tsx`。公共 UI 在 `src/components/ui`，摄影业务组件在 `src/components/business`，相机状态在 `src/store/captureStore.ts`，权限流程在 `src/hooks/useCameraFlow.ts`，相册写入在 `src/lib/media.ts`。

## 已包含

- 相机权限申请、取景器和拍摄流程
- 构图提示、移动距离提示、焦段切换和滤镜选择
- 拍摄预览与 `expo-media-library` 本地相册保存
- 「相机 / 灵感 / 相册 / 我的」四个底部导航页
- 暖米白、焦糖橙和胶片感的视觉系统，适配 iOS / Android 竖屏
- Expo Router 文件路由、全局 Stack 布局和自定义底部 TabBar

## 真实设备说明

`expo-camera` 和 `expo-media-library` 需要在真机或 Expo Development Build 中运行。当前前端使用远程灵感图作为占位素材，联网后可正常加载；你可以把图片替换为自己的本地资源。
