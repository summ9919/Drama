import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadows } from '../../constants/theme';
import { appConfig } from '../../constants/config';
import { IconButton } from '../ui/IconButton';

type Props = {
  cameraRef: React.RefObject<CameraView>;
  onClose: () => void;
  onCapture: () => void;
};

export function CameraCapture({ cameraRef, onClose, onCapture }: Props) {
  const [selectedZoom, setSelectedZoom] = useState<'0.5x' | '1x' | '2x'>('1x');
  const [zoom, setZoom] = useState(0.04);
  const [filter, setFilter] = useState('清透');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const filters = ['清透', '奶杏', '薄荷', '胶片'];
  const zoomValues: Record<'0.5x' | '1x' | '2x', number> = {
    '0.5x': 0,
    '1x': 0.04,
    '2x': 0.15,
  };

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} zoom={zoom} />
      <LinearGradient
        colors={['rgba(20,30,38,0.7)', 'transparent', 'rgba(20,30,38,0.85)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* ── 顶部栏 ── */}
        <View style={styles.topBar}>
          <IconButton icon="chevron-down" dark onPress={onClose} />

          {/* 模式选择 (Apple 雾态深色胶囊) */}
          <View style={styles.modePillOuter}>
            <BlurView
              intensity={50}
              tint="dark"
              style={[
                StyleSheet.absoluteFill,
                styles.pillBlur,
              ]}
            />
            <View style={[StyleSheet.absoluteFill, styles.darkPillBg]} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.darkPillBorder]} />

            <View style={styles.modeActive}>
              <Text style={styles.modeActiveText}>人像</Text>
            </View>
            <Pressable onPress={() => Alert.alert('胶片模式', '即将推出')}>
              <Text style={styles.modeText}>胶片</Text>
            </Pressable>
            <Pressable onPress={() => Alert.alert('夜景模式', '即将推出')}>
              <Text style={styles.modeText}>夜景</Text>
            </Pressable>
          </View>

          <IconButton
            icon="settings-outline"
            dark
            onPress={() => Alert.alert('设置', '自动白平衡已开启')}
          />
        </View>

        {/* ── 取景对焦指导 ── */}
        <View style={styles.guideArea}>
          <View style={styles.guideBracket} />
          <View style={styles.guideRing}>
            <View style={styles.guideDot} />
          </View>

          {/* 悬浮指导气泡 (Apple 雾态浮动卡) */}
          <View style={styles.coachBubbleWrapper}>
            <BlurView
              intensity={60}
              tint="light"
              style={[
                StyleSheet.absoluteFill,
                styles.bubbleBlur,
              ]}
            />
            <View style={[StyleSheet.absoluteFill, styles.coachGlassBg]} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.coachBorder]} />

            <View style={styles.coachContent}>
              <Text style={styles.coachTitle}>{appConfig.suggestedMove}</Text>
            </View>
          </View>

          {/* 底部小标签 */}
          <View style={styles.guideCaption}>
            <BlurView
              intensity={45}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            <View style={[StyleSheet.absoluteFill, styles.captionBg]} />
            <Ionicons name="sunny-outline" size={14} color={colors.whiteWarm} />
            <Text style={styles.guideCaptionText}>{appConfig.cameraGuide}</Text>
          </View>
        </View>

        {/* ── 底部控制板 ── */}
        <View style={styles.controls}>
          {/* 参数提示 */}
          <View style={styles.metaRow}>
            <Text style={styles.meta}>快门 1/250</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta}>ISO 100</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta}>自动白平衡</Text>
          </View>

          {/* 变焦切换 (Apple 玻璃小药丸) */}
          <View style={styles.zoomRow}>
            {(['0.5x', '1x', '2x'] as const).map((item) => {
              const active = selectedZoom === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setSelectedZoom(item);
                    setZoom(zoomValues[item]);
                  }}
                  style={({ pressed }) => [
                    styles.zoomChipOuter,
                    { transform: [{ scale: pressed ? 0.92 : 1 }] },
                  ]}
                >
                  <BlurView
                    intensity={active ? 60 : 45}
                    tint={active ? 'light' : 'dark'}
                    style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                  />
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      active ? styles.zoomActiveBg : styles.zoomInactiveBg,
                    ]}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: active ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.22)',
                      },
                    ]}
                  />
                  <Text style={[styles.zoomText, active && styles.zoomTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 核心快门栏 */}
          <View style={styles.captureRow}>
            {/* 相册缩略图入口 (玻璃圆钮) */}
            <Pressable
              style={({ pressed }) => [
                styles.sideButton,
                { transform: [{ scale: pressed ? 0.92 : 1 }] },
              ]}
              onPress={() => Alert.alert('预览', '拍摄后可以在这里查看最新照片。')}
            >
              <BlurView
                intensity={50}
                tint="dark"
                style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
              />
              <View style={[StyleSheet.absoluteFill, styles.sideButtonBg]} />
              <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.sideButtonBorder]} />
              <Ionicons name="image-outline" size={20} color={colors.whiteWarm} />
            </Pressable>

            {/* Apple 雾态发光快门按钮 */}
            <Pressable
              style={({ pressed }) => [
                styles.shutterOuter,
                { transform: [{ scale: pressed ? 0.93 : 1 }] },
              ]}
              onPress={onCapture}
            >
              <View style={styles.shutterHalo} />
              <View style={styles.shutterRing}>
                <View style={styles.shutterCenter} />
              </View>
            </Pressable>

            {/* 翻转镜头按钮 (玻璃圆钮) */}
            <Pressable
              style={({ pressed }) => [
                styles.sideButton,
                { transform: [{ scale: pressed ? 0.92 : 1 }] },
              ]}
              onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
            >
              <BlurView
                intensity={50}
                tint="dark"
                style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
              />
              <View style={[StyleSheet.absoluteFill, styles.sideButtonBg]} />
              <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.sideButtonBorder]} />
              <Ionicons name="camera-reverse-outline" size={22} color={colors.whiteWarm} />
            </Pressable>
          </View>

          {/* 滤镜胶囊栏 (Apple 雾态选择药丸) */}
          <View style={styles.filterRow}>
            {filters.map((item) => {
              const active = filter === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    { transform: [{ scale: pressed ? 0.94 : 1 }] },
                  ]}
                >
                  <BlurView
                    intensity={active ? 55 : 35}
                    tint={active ? 'light' : 'dark'}
                    style={[StyleSheet.absoluteFill, { borderRadius: 15 }]}
                  />
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      active ? styles.filterActiveBg : styles.filterInactiveBg,
                    ]}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: active ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.18)',
                      },
                    ]}
                  />
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* 顶部栏 */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  modePillOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  pillBlur: {
    borderRadius: 22,
  },
  darkPillBg: {
    borderRadius: 22,
    backgroundColor: 'rgba(20, 30, 38, 0.52)',
  },
  darkPillBorder: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  modeActive: {
    backgroundColor: 'rgba(243, 223, 181, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadows.glassSm,
  },
  modeActiveText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  modeText: {
    color: 'rgba(254, 253, 251, 0.85)',
    fontSize: 12,
    paddingHorizontal: 11,
    fontWeight: '500',
  },

  /* 取景指导 */
  guideArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  guideBracket: {
    width: 260,
    height: 340,
    borderWidth: 1,
    borderColor: 'rgba(254, 253, 251, 0.35)',
    borderRadius: 6,
  },
  guideRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: colors.mistBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.whiteWarm,
  },
  coachBubbleWrapper: {
    position: 'absolute',
    top: '30%',
    right: 22,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.glassMd,
  },
  bubbleBlur: {
    borderRadius: 20,
  },
  coachGlassBg: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  coachBorder: {
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  coachContent: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachTitle: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: '700',
  },
  guideCaption: {
    position: 'absolute',
    bottom: '16%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  captionBg: {
    backgroundColor: 'rgba(20, 30, 38, 0.52)',
  },
  guideCaptionText: {
    color: colors.whiteWarm,
    fontSize: 12,
  },

  /* 底部面板 */
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  meta: {
    color: 'rgba(254, 253, 251, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    color: 'rgba(254, 253, 251, 0.45)',
    fontSize: 11,
  },

  /* 变焦条 */
  zoomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  zoomChipOuter: {
    width: 48,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomActiveBg: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  zoomInactiveBg: {
    borderRadius: 16,
    backgroundColor: 'rgba(20, 30, 38, 0.55)',
  },
  zoomText: {
    color: colors.whiteWarm,
    fontSize: 12,
    fontWeight: '600',
    zIndex: 2,
  },
  zoomTextActive: {
    color: colors.ink,
    fontWeight: '700',
  },

  /* 快门行 */
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
  },
  sideButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glassDark,
  },
  sideButtonBg: {
    borderRadius: 23,
    backgroundColor: 'rgba(20, 30, 38, 0.55)',
  },
  sideButtonBorder: {
    borderRadius: 23,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  /* Apple 快门 */
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.glassDark,
  },
  shutterHalo: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shutterRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.whiteWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 201, 214, 0.45)',
  },
  shutterCenter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.whiteWarm,
  },

  /* 滤镜行 */
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  filterChip: {
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActiveBg: {
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  filterInactiveBg: {
    borderRadius: 15,
    backgroundColor: 'rgba(20, 30, 38, 0.45)',
  },
  filterText: {
    color: 'rgba(254, 253, 251, 0.65)',
    fontSize: 11.5,
    fontWeight: '500',
    zIndex: 2,
  },
  filterTextActive: {
    color: colors.whiteWarm,
    fontWeight: '700',
  },
});
