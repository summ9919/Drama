import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../constants/theme';
import { CAMERA_STYLES } from '../../constants/guidance';
import type { CameraStyle, PoseKeypoint, PoseTemplate } from '../../types/guidance';
import { useCameraGuidance } from '../../hooks/useCameraGuidance';
import { usePoseDetection } from '../../hooks/usePoseDetection';
import { usePoseStore } from '../../store/poseStore';
import { CameraGuidanceControls } from './CameraGuidanceControls';
import { CameraDirectionOverlay } from './CameraDirectionOverlay';
import { PoseOverlay } from './PoseOverlay';
import { PoseTemplateSelector } from './PoseTemplateSelector';
import { CameraReadyFrame, CameraReadyNotice, CameraShutterHalo } from './CameraReadyEffects';
import { digitalZoomFactor, getCameraViewport } from '../../lib/cameraGeometry';
import { getCompositionMessage } from '../../lib/compositionMessage';
import type { PoseMatchDetail } from '../../lib/poseMatching';

type Props = {
  cameraRef: React.RefObject<CameraView>;
  onClose: () => void;
  onCapture: (uri: string) => void;
  onConfigure: () => void;
};

export function CameraCapture({ cameraRef, onClose, onCapture, onConfigure }: Props) {
  const guide = useCameraGuidance(cameraRef, onCapture);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [headerHeight, setHeaderHeight] = useState(82);
  const [controlsHeight, setControlsHeight] = useState(290);
  const insets = useSafeAreaInsets();
  const { context } = guide;

  // 姿势引导检测与状态 (安全读取，兼容无原生 React Hook Dispatcher 的轻量测试环境)
  usePoseDetection(guide.active && guide.ready);
  let poseEnabled = false;
  let activePoseTemplate: PoseTemplate | null = null;
  let detectedKeypoints: PoseKeypoint[] = [];
  let poseMatchDetail: PoseMatchDetail = {
    score: 0,
    matched: false,
    near: false,
    boneStatus: [],
    feedbackTip: '',
  };

  try {
    poseEnabled = usePoseStore(state => state.enabled);
    activePoseTemplate = usePoseStore(state => state.getActiveTemplate());
    detectedKeypoints = usePoseStore(state => state.detectedKeypoints);
    poseMatchDetail = usePoseStore(state => state.matchDetail);
  } catch {
    const s = usePoseStore.getState();
    poseEnabled = s.enabled;
    activePoseTemplate = s.getActiveTemplate();
    detectedKeypoints = s.detectedKeypoints;
    poseMatchDetail = s.matchDetail;
  }

  const viewport = getCameraViewport(frame.width, frame.height, insets.top + headerHeight, insets.bottom + controlsHeight);
  const blocked = !guide.active || !guide.ready || guide.capturing || guide.sampling;

  // 判定是否达到“可以拍照”状态（融合构图对准与姿势重合）
  const guidanceReady = !guide.enabled || guide.executionPhase === 'ready';
  const poseReady = !poseEnabled || poseMatchDetail.matched;
  const anyGuideActive = guide.enabled || poseEnabled;
  const canShoot = anyGuideActive ? (guidanceReady && poseReady) : false;

  const message = guide.switching
    ? '正在切换镜头…'
    : getCompositionMessage(
        guide.enabled,
        guide.target,
        guide.result,
        guide.adjustingZoom,
        guide.autoZoom,
        guide.status,
        guide.executionPhase,
        poseEnabled,
        poseMatchDetail
      );

  return (
    <View collapsable={false} style={styles.screen} onLayout={event => setFrame(event.nativeEvent.layout)}>
      <StatusBar style="light" backgroundColor={colors.dark} translucent />
      {guide.active && viewport.width > 0 && (
        <View testID="camera-viewport" collapsable={false} style={[styles.cameraFrame, viewport]}>
          <View collapsable={false} style={[StyleSheet.absoluteFill, { transform: [{ scale: digitalZoomFactor(context.zoom) }] }]}>
            {/* Expo mirrors the front preview even when captured photos use mirror=false. */}
            {/* Keep one native view: Android releases the shared camera provider asynchronously on unmount. */}
            <CameraView
              ref={cameraRef}
              style={[StyleSheet.absoluteFill, { transform: [{ scaleX: context.facing === 'front' ? -1 : 1 }] }]}
              facing={context.facing}
              zoom={0}
              mirror={false}
              ratio="4:3"
              flash={context.flash}
              autofocus="off"
              animateShutter={false}
              onCameraReady={guide.cameraReady}
              onMountError={guide.cameraError}
            />
          </View>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.gridVertical, { left: '33.33%' }]} />
            <View style={[styles.gridVertical, { left: '66.66%' }]} />
            <View style={[styles.gridHorizontal, { top: '33.33%' }]} />
            <View style={[styles.gridHorizontal, { top: '66.66%' }]} />

            {/* 构图指引叠层（虚线与目标圆圈） */}
            <CameraDirectionOverlay
              target={guide.target}
              enabled={guide.enabled && guide.ready}
              width={viewport.width}
              height={viewport.height}
            />

            {/* 姿势矫正火柴人叠层 */}
            <PoseOverlay
              template={activePoseTemplate}
              detected={detectedKeypoints}
              matchDetail={poseMatchDetail}
              enabled={poseEnabled && guide.ready}
              width={viewport.width}
              height={viewport.height}
            />

            {/* 可以拍照了全屏高光特效 */}
            <CameraReadyFrame active={canShoot} width={viewport.width} height={viewport.height} />
          </View>
        </View>
      )}

      {/* Opaque sibling masks also cover SurfaceView overflow on Android. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.previewMask, { top: 0, left: 0, right: 0, height: viewport.top }]} />
        <View style={[styles.previewMask, { top: viewport.top + viewport.height, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.previewMask, { top: viewport.top, height: viewport.height, left: 0, width: viewport.left }]} />
        <View style={[styles.previewMask, { top: viewport.top, height: viewport.height, right: 0, width: viewport.left }]} />
      </View>

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View
          testID="camera-header"
          onLayout={event => {
            const h = Math.round(event.nativeEvent.layout.height);
            if (Math.abs(h - headerHeight) > 1) {
              setHeaderHeight(h);
            }
          }}
        >
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="关闭相机" onPress={onClose} style={styles.iconButton}>
              <Ionicons name="chevron-down" size={23} color="#FFFFFF" />
            </Pressable>
            <View style={styles.modes}>
              {(['人像', '风景', '夜景'] as const).map(mode => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: context.mode === mode }}
                  key={mode}
                  disabled={guide.capturing}
                  onPress={() => guide.changeMode(mode)}
                  style={[styles.mode, context.mode === mode && styles.modeActive]}
                >
                  <Text style={[styles.modeText, context.mode === mode && styles.modeTextActive]}>{mode}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="AI 配置" onPress={onConfigure} style={styles.iconButton}>
              <Ionicons name="options-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.previewLabel}>
            {context.facing === 'front' ? '前置 · 非镜像预览' : '后置相机'} · {context.style}风格
          </Text>
        </View>

        <View style={styles.viewfinderSpace} pointerEvents="none" />

        <View
          testID="camera-controls"
          style={styles.controls}
          onLayout={event => {
            const h = Math.round(event.nativeEvent.layout.height);
            if (Math.abs(h - controlsHeight) > 1) {
              setControlsHeight(h);
            }
          }}
        >
          <CameraReadyNotice active={canShoot} message={message} />

          {guide.enabled && guide.executionPhase === 'manual' && (
            <View style={styles.confirmSlot}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="手动确认已调整"
                disabled={guide.capturing || !guide.ready}
                onPress={guide.confirmAdjustment}
                style={styles.confirmStep}
              >
                <Text style={styles.confirmStepText}>已调整，确认到位</Text>
              </Pressable>
            </View>
          )}

          {guide.enabled && guide.result && (
            <View
              testID="camera-advice"
              accessibilityElementsHidden={canShoot}
              importantForAccessibility={canShoot ? 'no-hide-descendants' : 'auto'}
              style={[styles.advice, canShoot && { opacity: 0 }]}
            >
              {message !== guide.result.advice.summary && <Text style={styles.adviceText}>{guide.result.advice.summary}</Text>}
              <Text style={styles.lightText}>光线：{guide.result.advice.light}</Text>
            </View>
          )}

          {/* 姿势矫正选择器条（火柴人姿态库） */}
          <PoseTemplateSelector disabled={guide.capturing} />

          {/* 构图 AI 引导控制栏 */}
          <CameraGuidanceControls
            enabled={guide.enabled}
            starting={guide.starting}
            disabled={guide.capturing}
            autoZoom={guide.autoZoom}
            status={guide.status}
            configMissing={guide.configMissing}
            onToggle={() => void guide.toggleGuidance()}
            onAutoZoom={guide.toggleAutoZoom}
            onRefresh={guide.refresh}
            onConfigure={onConfigure}
          />

          <View style={styles.zoomRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="缩小画面"
              disabled={guide.capturing || context.zoom <= 0}
              onPress={() => guide.manualZoom(context.zoom - 0.025)}
              style={styles.zoomButton}
            >
              <Ionicons name="remove" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="恢复原始变焦"
              disabled={guide.capturing}
              onPress={() => guide.manualZoom(0)}
              style={styles.zoomLabel}
            >
              <Text style={styles.zoomText}>
                {context.zoom < 0.001 ? '1.0× 原始视野' : `${digitalZoomFactor(context.zoom).toFixed(2)}× 数字变焦`}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="放大画面"
              disabled={guide.capturing || context.zoom >= 1}
              onPress={() => guide.manualZoom(context.zoom + 0.025)}
              style={styles.zoomButton}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.captureRow}>
            <View style={styles.sideLabel}>
              <Text style={styles.meta}>系统自动曝光</Text>
              <Text style={styles.meta}>闪光灯 · {context.flash === 'on' ? '开' : context.flash === 'auto' ? '自动' : '关'}</Text>
            </View>
            <View style={styles.shutterArea}>
              <CameraShutterHalo active={canShoot} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="拍照"
                disabled={!guide.ready || guide.capturing || !guide.active || guide.executionPhase === 'parameters'}
                onPress={() => void guide.capture()}
                style={({ pressed }) => [
                  styles.shutter,
                  canShoot && styles.readyShutter,
                  (!guide.ready || guide.capturing) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.shutterInner, canShoot && styles.readyShutterInner]}>
                  {guide.capturing ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    canShoot && <Ionicons name="camera" size={25} color="#174A35" />
                  )}
                </View>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="切换前后镜头"
              disabled={blocked}
              accessibilityState={{ disabled: blocked, busy: guide.switching }}
              onPress={guide.flipCamera}
              style={[styles.flip, blocked && styles.disabled]}
            >
              {guide.switching ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="camera-reverse-outline" size={25} color="#FFFFFF" />}
            </Pressable>
          </View>

          <Text style={styles.tuningText}>{guide.tuningMessage}</Text>
          <View style={styles.filters}>
            {(Object.keys(CAMERA_STYLES) as CameraStyle[]).map(style => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: context.style === style }}
                key={style}
                disabled={guide.capturing}
                onPress={() => guide.changeStyle(style)}
                style={[styles.filter, context.style === style && styles.filterActive]}
              >
                <Text style={styles.filterText}>{style}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  cameraFrame: { position: 'absolute', overflow: 'hidden' },
  previewMask: { position: 'absolute', backgroundColor: colors.dark },
  overlay: { flex: 1, width: '100%', maxWidth: 720 },
  gridVertical: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: '#FFFFFF50' },
  gridHorizontal: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#FFFFFF50' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6, gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1D2A3499', alignItems: 'center', justifyContent: 'center' },
  modes: { flexDirection: 'row', borderRadius: 20, padding: 3, backgroundColor: '#1D2A34BB' },
  mode: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 17 },
  modeActive: { backgroundColor: '#F3DFB5' },
  modeText: { color: '#FFFFFF', fontSize: 12 },
  modeTextActive: { color: colors.ink, fontWeight: '700' },
  viewfinderSpace: { flex: 1 },
  previewLabel: { alignSelf: 'center', marginTop: 4, marginBottom: 6, fontSize: 10, color: '#FFFFFFCC', paddingHorizontal: 8, paddingVertical: 2 },
  controls: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6 },
  guidanceMessage: { textAlign: 'center', color: '#BCD3CB', fontSize: 13, lineHeight: 18, minHeight: 28, marginBottom: 4 },
  readyMessage: { color: '#7FF0BE', fontSize: 18, fontWeight: '700' },
  readyShutter: { borderColor: '#7FF0BE' },
  readyShutterInner: { backgroundColor: '#A5FFD7' },
  shutterArea: { width: 78, height: 78, alignItems: 'center', justifyContent: 'center' },
  tuningText: { color: '#AFC3BB', fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 3 },
  confirmStep: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#28453D' },
  confirmSlot: { justifyContent: 'center', marginVertical: 4 },
  confirmStepText: { color: '#BCF5E4', fontSize: 12, fontWeight: '600' },
  advice: { alignItems: 'center', marginBottom: 4, gap: 2 },
  adviceText: { color: '#E5EEE9', fontSize: 12, lineHeight: 16, textAlign: 'center' },
  lightText: { color: '#AFC3BB', fontSize: 11, lineHeight: 15, textAlign: 'center' },
  zoomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 6 },
  zoomButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#273A48CC', alignItems: 'center', justifyContent: 'center' },
  zoomLabel: { minWidth: 100, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center' },
  zoomText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sideLabel: { width: 88, gap: 3 },
  meta: { fontSize: 10, color: '#C6D3DC' },
  shutter: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  flip: { width: 88, height: 46, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.94 }] },
  disabled: { opacity: 0.4 },
  filters: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 6 },
  filter: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: 12, backgroundColor: '#273A4899' },
  filterActive: { backgroundColor: '#587991' },
  filterText: { fontSize: 12, color: '#FFFFFF' },
});
