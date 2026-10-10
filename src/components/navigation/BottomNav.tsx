import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../constants/theme';

const labels: Record<string, string> = {
  camera: '相机',
  inspiration: '灵感',
  album: '相册',
  profile: '我的',
};

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  camera: 'camera-outline',
  inspiration: 'compass-outline',
  album: 'images-outline',
  profile: 'person-outline',
};

const iconsFilled: Record<string, keyof typeof Ionicons.glyphMap> = {
  camera: 'camera',
  inspiration: 'compass',
  album: 'images',
  profile: 'person',
};

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      {/* 居中透明底栏容器 */}
      <View style={styles.dockCapsule}>
        {/* 背景高透明度毛玻璃底层 */}
        <View style={[StyleSheet.absoluteFill, styles.dockBgContainer]} pointerEvents="none">
          <BlurView
            intensity={35}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          {/* 更高透明度的毛玻璃底色 */}
          <View style={[StyleSheet.absoluteFill, styles.dockGlassBg]} />
          {/* 顶端柔和通透反光 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.7 }}
            style={StyleSheet.absoluteFill}
          />
          {/* 纤细光泽描边 */}
          <View style={[StyleSheet.absoluteFill, styles.dockBorder]} />
        </View>

        {/* 切换 Tab 列表 */}
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                style={({ pressed }) => [
                  styles.tabItem,
                  focused && styles.tabItemActive,
                  {
                    transform: [
                      { scale: focused ? (pressed ? 1.04 : 1.08) : (pressed ? 0.95 : 1) },
                      { translateY: focused ? -1.5 : 0 },
                    ],
                  },
                ]}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              >
                {/* 选中项：全透明玻璃放大镜透镜层 */}
                {focused && (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {/* 放大镜微模糊层 */}
                    <BlurView
                      intensity={28}
                      tint="light"
                      style={[StyleSheet.absoluteFill, styles.lensBlur]}
                    />
                    {/* 全透明高透镜片底色 */}
                    <View style={[StyleSheet.absoluteFill, styles.lensGlassBg]} />
                    {/* 保留均匀玻璃质感，移除左上角聚集的白色反光 */}
                    <View style={[StyleSheet.absoluteFill, styles.lensBorder]} />
                  </View>
                )}

                <Ionicons
                  name={
                    focused
                      ? iconsFilled[route.name] ?? 'ellipse'
                      : icons[route.name] ?? 'ellipse-outline'
                  }
                  size={focused ? 17.5 : 15.5}
                  color={focused ? colors.ink : 'rgba(28, 58, 54, 0.62)'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    focused && styles.tabLabelActive,
                  ]}
                >
                  {labels[route.name] ?? route.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // 左右完全透明背景
    paddingHorizontal: 16,
  },
  dockCapsule: {
    borderRadius: 9999, // 纯圆角胶囊
    position: 'relative',
    padding: 5,
    ...shadows.glassSm,
  },
  dockBgContainer: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  dockGlassBg: {
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)', // 透明度更高的高透毛玻璃底色
  },
  dockBorder: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)', // 通透柔和微光边缘
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 9999,
    gap: 5.5,
    position: 'relative',
  },
  tabItemActive: {
    zIndex: 10,
    shadowColor: '#103935',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  lensBlur: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  lensGlassBg: {
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)', // 全透明玻璃，完全通透
  },
  lensBorder: {
    borderRadius: 9999,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)', // 晶莹剔透的水晶镜片边框
  },
  tabLabel: {
    color: 'rgba(28, 58, 54, 0.62)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.ink,
    fontSize: 13.8, // 放大镜略微放大字号
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
