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
        {/* 背景高通透毛玻璃底层 */}
        <View style={[StyleSheet.absoluteFill, styles.dockBgContainer]} pointerEvents="none">
          <BlurView
            intensity={50}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.dockGlassBg]} />
          {/* 顶端柔和通透反光 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.0)']}
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
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              >
                {/* 选中项：清新薄荷柔光胶囊 */}
                {focused && (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <View style={[StyleSheet.absoluteFill, styles.activePillBg]} />
                    <View style={[StyleSheet.absoluteFill, styles.activePillBorder]} />
                  </View>
                )}

                <Ionicons
                  name={
                    focused
                      ? iconsFilled[route.name] ?? 'ellipse'
                      : icons[route.name] ?? 'ellipse-outline'
                  }
                  size={17}
                  color={focused ? colors.primary : '#7E8F9B'}
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
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  dockCapsule: {
    borderRadius: 9999,
    position: 'relative',
    padding: 5,
    ...shadows.glassMd,
  },
  dockBgContainer: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  dockGlassBg: {
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  dockBorder: {
    borderRadius: 9999,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
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
    paddingHorizontal: 14,
    borderRadius: 9999,
    gap: 5,
    position: 'relative',
  },
  tabItemActive: {
    zIndex: 10,
  },
  activePillBg: {
    borderRadius: 9999,
    backgroundColor: 'rgba(45, 117, 101, 0.12)',
  },
  activePillBorder: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(45, 117, 101, 0.22)',
  },
  tabLabel: {
    color: '#7E8F9B',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
