import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/theme';

export function Screen({ children, ...props }: ViewProps) {
  return (
    <View style={styles.container}>
      {/* ── Apple Liquid Wallpaper 高对比度渐变基底 ── */}
      {/* 从饱满清透的雾蓝到温润黄油奶油的大跨度渐变，为上层毛玻璃提供极佳的折射与光影反差 */}
      <LinearGradient
        colors={['#C8DBE8', '#D7E4EE', '#E9E5DA', '#F2E5CD']}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* 顶部深雾蓝漫反射光晕 (让顶部卡片与Header产生透光折射) */}
      <View style={styles.orbMistBlueTop} pointerEvents="none" />

      {/* 中部右侧浓郁黄油光晕 (卡片穿过时产生冷暖交融的毛玻璃色相过渡) */}
      <View style={styles.orbButterMid} pointerEvents="none" />

      {/* 底部浮动光斑 (正对底部Dock栏，使全透明放大镜透镜折射效果极致明显) */}
      <View style={styles.orbBottomDock} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View {...props} style={[styles.content, props.style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    position: 'relative',
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  orbMistBlueTop: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(142, 172, 196, 0.45)', // 饱和雾蓝光斑
  },
  orbButterMid: {
    position: 'absolute',
    top: '34%',
    right: -80,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(243, 219, 168, 0.55)', // 浓郁温润黄油奶油光斑
  },
  orbBottomDock: {
    position: 'absolute',
    bottom: -50,
    left: '10%',
    width: 340,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(158, 187, 208, 0.48)', // 底部高饱和雾蓝折射源
  },
});
