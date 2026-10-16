import * as React from 'react';
import { usePoseStore } from '../store/poseStore';
import { defaultPoseDetector } from '../lib/poseDetection';

export function usePoseDetection(active = true) {
  // 环境适配保护：若在极简测试 mock 环境中（无完整 React hooks），安全退出
  if (typeof React?.useRef !== 'function' || typeof React?.useEffect !== 'function') {
    return;
  }

  let enabled = false;
  try {
    enabled = usePoseStore(state => state.enabled);
  } catch {
    enabled = usePoseStore.getState().enabled;
  }

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    const store = usePoseStore.getState();
    if (!enabled || !active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      store.resetPose();
      return;
    }

    // 运行姿势检测循环（约 4~5 FPS，兼顾流畅度与性能）
    const detectFrame = async () => {
      try {
        const keypoints = await defaultPoseDetector.detectFromSample('frame');
        store.updateDetectedKeypoints(keypoints);
      } catch {
        // 静默处理，不阻塞主流程
      }
    };

    void detectFrame();
    timerRef.current = setInterval(detectFrame, 220);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, active]);
}
