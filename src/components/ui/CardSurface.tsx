import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  radius: number;
  borderWidth: number;
  borderColor: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function CardSurface({
  children,
  radius,
  borderWidth,
  borderColor,
  style,
  contentStyle,
}: Props) {
  return (
    <View style={[styles.outer, { borderRadius: radius }, style]}>
      {/* ── 玻璃液态背景层 (与底栏导航 dockCapsule 保持完全一致的通透水感) ── */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.glassContainer,
          { borderRadius: radius },
        ]}
      >
        {/* Apple 雾态毛玻璃模糊底层 */}
        <BlurView
          intensity={35}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        {/* 高透液态玻璃底色 */}
        <View style={[StyleSheet.absoluteFill, styles.liquidGlassBg]} />
        {/* 顶部柔和微通透反光 */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
        {/* 纤细光泽微光描边 */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth,
              borderColor: borderColor || 'rgba(255, 255, 255, 0.65)',
            },
          ]}
        />
      </View>

      {/* ── 卡片实体内容容器 ── */}
      <View
        testID="card-surface-background"
        collapsable={false}
        style={[
          contentStyle,
          styles.contentWrap,
          { borderRadius: radius },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  glassContainer: {
    overflow: 'hidden',
  },
  liquidGlassBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)', // 与导航栏 dockGlassBg 完全一致的高透水感底色
  },
  contentWrap: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
