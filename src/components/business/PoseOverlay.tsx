import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { POSE_SKELETON_BONES } from '../../constants/poseConfig';
import type { PoseKeypoint, PoseTemplate } from '../../types/guidance';
import type { PoseMatchDetail } from '../../lib/poseMatching';

type Props = {
  template: PoseTemplate | null;
  detected: PoseKeypoint[];
  matchDetail: PoseMatchDetail;
  enabled: boolean;
  width: number;
  height: number;
};

// 渲染两点之间的连线
function BoneLine({
  p1,
  p2,
  color,
  thickness = 3,
  dashed = false,
  opacity = 1,
}: {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  color: string;
  thickness?: number;
  dashed?: boolean;
  opacity?: number;
}) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy);
  if (length < 2) return null;

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const angle = Math.atan2(dy, dx);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.boneLine,
        {
          left: midX - length / 2,
          top: midY - thickness / 2,
          width: length,
          height: thickness,
          backgroundColor: color,
          opacity,
          transform: [{ rotate: `${angle}rad` }],
          borderRadius: thickness / 2,
          borderStyle: dashed ? 'dashed' : 'solid',
        },
      ]}
    />
  );
}

export function PoseOverlay({ template, detected, matchDetail, enabled, width, height }: Props) {
  if (!enabled || !template || width <= 0 || height <= 0) return null;

  const targetMap = new Map(template.keypoints.map(kp => [kp.name, { x: kp.x * width, y: kp.y * height }]));
  const detectedMap = new Map(detected.map(kp => [kp.name, { x: kp.x * width, y: kp.y * height, conf: kp.confidence ?? 1 }]));

  const nose = targetMap.get('nose');
  const leftEye = targetMap.get('left_eye');
  const rightEye = targetMap.get('right_eye');

  const headCenter = nose || (leftEye && rightEye ? { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 } : null);
  const headRadius = Math.max(16, width * 0.055);

  const isMatched = matchDetail.matched;
  const targetColor = isMatched ? '#7FF0BE' : matchDetail.near ? '#F6DF95' : 'rgba(255, 255, 255, 0.75)';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* 1. 目标火柴人姿态 (虚线/半透明优雅模板) */}
      {/* 头部圆环 */}
      {headCenter && (
        <View
          style={[
            styles.headCircle,
            {
              left: headCenter.x - headRadius,
              top: headCenter.y - headRadius * 1.1,
              width: headRadius * 2,
              height: headRadius * 2.2,
              borderRadius: headRadius,
              borderColor: targetColor,
              backgroundColor: isMatched ? 'rgba(127, 240, 190, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            },
          ]}
        />
      )}

      {/* 骨骼连接线 */}
      {POSE_SKELETON_BONES.map(([fromName, toName], index) => {
        const p1 = targetMap.get(fromName);
        const p2 = targetMap.get(toName);
        if (!p1 || !p2) return null;

        return (
          <BoneLine
            key={`target-${index}`}
            p1={p1}
            p2={p2}
            color={targetColor}
            thickness={isMatched ? 3.5 : 2.5}
            opacity={isMatched ? 0.9 : 0.65}
          />
        );
      })}

      {/* 目标关节定位圆点 */}
      {template.keypoints.map(kp => {
        const pt = targetMap.get(kp.name);
        if (!pt) return null;
        return (
          <View
            key={`target-pt-${kp.name}`}
            style={[
              styles.targetJoint,
              {
                left: pt.x - 3.5,
                top: pt.y - 3.5,
                borderColor: targetColor,
              },
            ]}
          />
        );
      })}

      {/* 2. 实时检测到的人体骨骼 (若有检测结果) */}
      {detected.length > 0 &&
        POSE_SKELETON_BONES.map(([fromName, toName], index) => {
          const d1 = detectedMap.get(fromName);
          const d2 = detectedMap.get(toName);
          if (!d1 || !d2 || d1.conf < 0.25 || d2.conf < 0.25) return null;

          const boneStatus = matchDetail.boneStatus.find(
            bs => (bs.bone[0] === fromName && bs.bone[1] === toName) || (bs.bone[0] === toName && bs.bone[1] === fromName)
          );

          const liveColor = boneStatus?.matched ? '#7FF0BE' : matchDetail.near ? '#F9DF88' : '#FF8080';

          return (
            <BoneLine
              key={`live-${index}`}
              p1={d1}
              p2={d2}
              color={liveColor}
              thickness={4}
              opacity={0.85}
            />
          );
        })}

      {/* 3. 顶部姿势微标牌 */}
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, isMatched && styles.badgeMatched, matchDetail.near && !isMatched && styles.badgeNear]}>
          <Text style={styles.badgeIcon}>{template.icon}</Text>
          <Text style={[styles.badgeText, isMatched && styles.badgeTextMatched]}>
            {template.name} · {Math.round(matchDetail.score * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boneLine: {
    position: 'absolute',
  },
  headCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  targetJoint: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(29, 42, 52, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeNear: {
    borderColor: '#F6DF95',
    backgroundColor: 'rgba(40, 50, 45, 0.85)',
  },
  badgeMatched: {
    borderColor: '#7FF0BE',
    backgroundColor: 'rgba(20, 60, 45, 0.9)',
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    color: '#E5EEE9',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextMatched: {
    color: '#7FF0BE',
  },
});
