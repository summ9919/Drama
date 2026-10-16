import type { PoseKeypointName } from '../types/guidance';

export const POSE_KEYPOINT_NAMES: PoseKeypointName[] = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
];

// 骨骼连线配对（起点到终点）
export const POSE_SKELETON_BONES: Array<[PoseKeypointName, PoseKeypointName]> = [
  // 头部面部
  ['left_ear', 'left_eye'],
  ['left_eye', 'nose'],
  ['nose', 'right_eye'],
  ['right_eye', 'right_ear'],
  // 肩部与躯干
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  // 左臂
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  // 右臂
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  // 左腿
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  // 右腿
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

// 匹配度阈值
export const POSE_THRESHOLDS = {
  // 达到此分数认为姿势已经重合匹配
  MATCH_SCORE: 0.72,
  // 达到此分数认为接近（提示变黄/微绿）
  NEAR_SCORE: 0.50,
  // 稳定要求保持时长 (ms)
  HOLD_MS: 700,
  // 关键点置信度最低过滤值
  MIN_CONFIDENCE: 0.25,
};
