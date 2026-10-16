import type { AIProfile, AIProvider } from './ai';

export type CameraStyle = '清透' | '奶杏' | '薄荷' | '胶片';
export type CameraMode = '人像' | '风景' | '夜景';
export type WhiteBalance = 'auto' | 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent';
export type CameraCapabilities = { native: boolean; cameraId: string; apertures: number[]; contrast: boolean; whiteBalance: WhiteBalance[] };
export type GuidanceContext = {
  style: CameraStyle;
  mode: CameraMode;
  facing: 'front' | 'back';
  zoom: number;
  flash: 'off' | 'on' | 'auto';
  capabilities?: CameraCapabilities;
};
export type GuidanceConfig = AIProfile & { provider: AIProvider };

// 17 个关键点命名（对齐 MoveNet / COCO 标准）
export type PoseKeypointName =
  | 'nose'
  | 'left_eye'
  | 'right_eye'
  | 'left_ear'
  | 'right_ear'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee'
  | 'left_ankle'
  | 'right_ankle';

export type PoseKeypoint = {
  name: PoseKeypointName;
  x: number; // 0-1 归一化坐标
  y: number; // 0-1 归一化坐标
  confidence?: number; // 0-1
};

export type PoseTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'portrait' | 'casual' | 'artistic';
  keypoints: Array<{ name: PoseKeypointName; x: number; y: number }>;
  weights?: Partial<Record<PoseKeypointName, number>>;
  tolerance?: number;
};

export type PoseGuidance = {
  enabled: boolean;
  templateId: string | null;
  customPose?: Array<{ name: PoseKeypointName; x: number; y: number }> | null;
  poseSummary: string;
};

export type Guidance = {
  version: 3;
  state: 'aim' | 'adjust' | 'ready' | 'uncertain';
  summary: string;
  horizontal: 'left' | 'right' | 'hold';
  vertical: 'raise' | 'lower' | 'hold';
  tilt: 'up' | 'down' | 'hold';
  distance: 'closer' | 'farther' | 'hold';
  zoom: 'in' | 'out' | 'hold';
  light: string;
  confidence: number;
  // Point in the current, unmirrored image to bring to the viewfinder center.
  aimPoint: { x: number; y: number } | null;
  readyToShoot: boolean;
  route: { path: 'straight' | 'none'; holdMs: 800 };
  camera: { zoomFactor: number | null; flash: 'keep' | 'off' | 'on' | 'auto'; aperture: number | null; contrast: number | null; whiteBalance: WhiteBalance | 'keep' };
  pose?: PoseGuidance;
};
export type GuidanceSample = { dataUrl: string; capturedAt: number };
export type GuidanceResult = { advice: Guidance; capturedAt: number; receivedAt: number };
export type GuidanceStatus = { phase: 'off' | 'waiting' | 'sampling' | 'analyzing' | 'ready' | 'error'; message: string };
