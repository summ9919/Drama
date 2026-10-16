import { POSE_SKELETON_BONES, POSE_THRESHOLDS } from '../constants/poseConfig';
import type { PoseKeypoint, PoseKeypointName } from '../types/guidance';

export type BoneAlignmentStatus = {
  bone: [PoseKeypointName, PoseKeypointName];
  score: number; // 0 ~ 1
  matched: boolean;
};

export type PoseMatchDetail = {
  score: number; // 整体加权匹配分数 0 ~ 1
  matched: boolean; // 是否达到匹配阈值
  near: boolean; // 是否接近
  boneStatus: BoneAlignmentStatus[];
  feedbackTip: string; // 调整提示文案，例如 "左手臂稍往外展"、"姿势很棒，保持住！"
};

/**
 * 计算两个二维点构成的归一化方向向量
 */
function getVector(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-4) return { dx: 0, dy: 0, len: 0 };
  return { dx: dx / len, dy: dy / len, len };
}

/**
 * 计算两个向量的余弦相似度 [-1, 1] 映射到 [0, 1]
 */
function vectorSimilarity(v1: { dx: number; dy: number }, v2: { dx: number; dy: number }) {
  const dot = v1.dx * v2.dx + v1.dy * v2.dy;
  return Math.max(0, Math.min(1, (dot + 1) / 2));
}

/**
 * 评估检测到的姿势与目标姿势的匹配度
 */
export function evaluatePoseMatch(
  detected: PoseKeypoint[],
  targetKeypoints: Array<{ name: PoseKeypointName; x: number; y: number }>,
  customThreshold?: number
): PoseMatchDetail {
  const threshold = customThreshold ?? POSE_THRESHOLDS.MATCH_SCORE;
  const targetMap = new Map(targetKeypoints.map(kp => [kp.name, kp]));
  const detectedMap = new Map(detected.map(kp => [kp.name, kp]));

  if (detected.length < 5) {
    return {
      score: 0,
      matched: false,
      near: false,
      boneStatus: [],
      feedbackTip: '请站入画面中，让镜头看清全身或半身',
    };
  }

  const boneStatus: BoneAlignmentStatus[] = [];
  let totalScore = 0;
  let evaluatedBonesCount = 0;
  const mismatchedBones: string[] = [];

  for (const [fromName, toName] of POSE_SKELETON_BONES) {
    const tFrom = targetMap.get(fromName);
    const tTo = targetMap.get(toName);
    const dFrom = detectedMap.get(fromName);
    const dTo = detectedMap.get(toName);

    if (!tFrom || !tTo || !dFrom || !dTo) continue;

    // 若检测关键点置信度过低，给予轻度保底评分
    const confFrom = dFrom.confidence ?? 1;
    const confTo = dTo.confidence ?? 1;
    const avgConf = (confFrom + confTo) / 2;

    if (avgConf < POSE_THRESHOLDS.MIN_CONFIDENCE) continue;

    const tVec = getVector(tFrom, tTo);
    const dVec = getVector(dFrom, dTo);

    // 向量方向相似度 (权重 70%)
    const dirSim = vectorSimilarity(tVec, dVec);

    // 相对空间位置距离相似度 (权重 30%)
    const distFrom = Math.hypot(dFrom.x - tFrom.x, dFrom.y - tFrom.y);
    const distTo = Math.hypot(dTo.x - tTo.x, dTo.y - tTo.y);
    const posSim = Math.max(0, 1 - (distFrom + distTo) * 2.5);

    const boneScore = dirSim * 0.7 + posSim * 0.3;
    const isMatched = boneScore >= 0.70;

    boneStatus.push({
      bone: [fromName, toName],
      score: boneScore,
      matched: isMatched,
    });

    totalScore += boneScore * avgConf;
    evaluatedBonesCount += avgConf;

    if (!isMatched) {
      if (fromName.includes('arm') || fromName.includes('elbow') || toName.includes('wrist')) {
        mismatchedBones.push(fromName.startsWith('left') ? '左手' : '右手');
      } else if (fromName.includes('leg') || fromName.includes('knee') || toName.includes('ankle')) {
        mismatchedBones.push(fromName.startsWith('left') ? '左腿' : '右腿');
      }
    }
  }

  const finalScore = evaluatedBonesCount > 0 ? totalScore / evaluatedBonesCount : 0;
  const isMatch = finalScore >= threshold;
  const isNear = finalScore >= POSE_THRESHOLDS.NEAR_SCORE;

  let feedback = '对齐虚线火柴人';
  if (isMatch) {
    feedback = '✦ 姿势完美，稳住手机准备拍摄';
  } else if (isNear) {
    if (mismatchedBones.length > 0) {
      const uniquePart = Array.from(new Set(mismatchedBones))[0];
      feedback = `接近了，微调一下${uniquePart}姿态`;
    } else {
      feedback = '很接近了，微调身体与虚线重合';
    }
  } else {
    feedback = '请参照画面火柴人调整肢体姿势';
  }

  return {
    score: Math.min(1, Math.max(0, finalScore)),
    matched: isMatch,
    near: isNear,
    boneStatus,
    feedbackTip: feedback,
  };
}
