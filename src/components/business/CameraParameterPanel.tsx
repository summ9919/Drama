import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { SYSTEM_CAMERA_CAPABILITIES } from '../../constants/cameraCapabilities';
import type { CameraCapabilities, GuidanceContext } from '../../types/guidance';
import type { ManualCameraSettings } from '../../hooks/useCameraGuidance';

const WB_LABELS: Record<string, string> = { auto: '自动', daylight: '日光', cloudy: '阴天', tungsten: '钨丝灯', fluorescent: '荧光灯' };
const FLASH = ['off', 'auto', 'on'] as const;
const FLASH_LABELS = ['关', '自动', '开'];
const PARAMETERS = [
  { id: 'zoom', label: '变焦' }, { id: 'aperture', label: '光圈' },
  { id: 'whiteBalance', label: '白平衡' }, { id: 'contrast', label: '对比度' }, { id: 'flash', label: '闪光灯' },
] as const;
type Parameter = typeof PARAMETERS[number]['id'];

export function ParameterWheel({ value, max, disabled, label, valueText, formatValue, onChange, onCommit }: {
  value: number; max: number; disabled: boolean; label: string; valueText: string;
  formatValue: (value: number) => string;
  onChange: (value: number) => void; onCommit: (value: number) => void;
}) {
  const [width, setWidth] = useState(300);
  const [position, setPosition] = useState(value);
  const dragging = useRef(false);
  const origin = useRef({ x: 0, value });
  const latest = useRef(value);
  const spacing = max <= 10 ? 64 : 8;
  const majorEvery = max <= 10 ? 1 : max > 100 ? 10 : 5;
  useEffect(() => {
    if (!dragging.current) { latest.current = value; setPosition(value); }
  }, [value]);
  const clamp = (next: number) => Math.max(0, Math.min(max, Math.round(next)));
  const turn = (x: number) => {
    if (disabled || !dragging.current) return;
    // Relative travel behaves like a physical dial: touching never jumps values.
    const next = Math.max(0, Math.min(max, origin.current.value + (origin.current.x - x) / spacing));
    setPosition(next);
    const detent = clamp(next);
    if (latest.current !== detent) { latest.current = detent; onChange(detent); }
  };
  const finish = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const snapped = disabled ? value : latest.current;
    setPosition(snapped);
    if (!disabled && snapped !== origin.current.value) onCommit(snapped);
  };
  const step = (direction: number) => {
    if (disabled) return;
    const next = clamp(value + direction);
    if (next === value) return;
    latest.current = next; setPosition(next); onChange(next); onCommit(next);
  };
  const radius = Math.ceil(width / spacing / 2) + 1;
  const center = Math.floor(position);
  const ticks = Array.from({ length: radius * 2 + 1 }, (_, index) => center + index - radius);
  const ribs = Array.from({ length: Math.ceil(width / 8) + 3 }, (_, index) => index * 8 - (position * spacing % 8) - 8);
  return (
    <View style={[styles.wheelRow, disabled && styles.disabled]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}减小一格`} disabled={disabled || value <= 0}
        onPress={() => step(-1)} style={[styles.wheelStep, (disabled || value <= 0) && styles.disabled]}>
        <Ionicons name="remove" size={18} color={colors.ink} />
      </Pressable>
    <View accessibilityRole="adjustable" accessibilityLabel={label}
      accessibilityState={{ disabled }} accessibilityValue={{ min: 0, max, now: value, text: valueText }}
      aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText}
      accessibilityActions={[{ name: 'increment', label: '增大' }, { name: 'decrement', label: '减小' }]}
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'increment') step(1);
        else if (event.nativeEvent.actionName === 'decrement') step(-1);
      }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled} onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={event => {
        dragging.current = true;
        origin.current = { x: event.nativeEvent.pageX, value };
        latest.current = value;
      }}
      onResponderMove={event => turn(event.nativeEvent.pageX)}
      onResponderRelease={finish}
      onResponderTerminate={() => {
        dragging.current = false; latest.current = origin.current.value;
        setPosition(origin.current.value); onChange(origin.current.value);
      }}
      onResponderTerminationRequest={() => false}
      style={styles.wheelControl}>
      <View pointerEvents="none" style={styles.wheelPointer} />
      <View pointerEvents="none" style={styles.wheelDrum}>
        <LinearGradient colors={['#494640', '#26241F', '#181612', '#39362F']} locations={[0, 0.32, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
        {ribs.map((left, index) => <View key={`rib-${index}`} style={[styles.wheelRib, { left }]} />)}
        {ticks.map(tick => {
          const valid = tick >= 0 && tick <= max;
          const major = tick % majorEvery === 0;
          const selected = valid && tick === Math.round(position);
          return <View key={tick} style={[styles.wheelGroove, { left: width / 2 + (tick - position) * spacing }]}>
            {valid && <View style={[styles.wheelTick, major && styles.wheelMajorTick, selected && styles.wheelSelectedTick]} />}
            {valid && major && <Text style={[styles.wheelNumber, selected && styles.wheelSelectedNumber]} numberOfLines={1}>{formatValue(tick)}</Text>}
          </View>;
        })}
        <View style={[styles.wheelSelection, { width: Math.min(40, spacing), marginLeft: -Math.min(40, spacing) / 2 }]} />
        <LinearGradient colors={['rgba(12,11,9,0.92)', 'rgba(12,11,9,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.wheelShadeLeft} />
        <LinearGradient colors={['rgba(12,11,9,0)', 'rgba(12,11,9,0.92)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.wheelShadeRight} />
      </View>
      <View pointerEvents="none" style={styles.wheelIndex} />
    </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}增大一格`} disabled={disabled || value >= max}
        onPress={() => step(1)} style={[styles.wheelStep, (disabled || value >= max) && styles.disabled]}>
        <Ionicons name="add" size={18} color={colors.ink} />
      </Pressable>
      </View>
  );
}

export function CameraParameterPanel({ visible, context, appliedTuning, disabled, busy, message, onClose, onChange }: {
  visible: boolean; context: GuidanceContext; appliedTuning: ManualCameraSettings | null;
  disabled: boolean; busy: boolean; message: string; onClose: () => void;
  onChange: (change: ManualCameraSettings) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Parameter>('zoom');
  const [draft, setDraft] = useState(0);
  const caps: CameraCapabilities = context.capabilities ?? SYSTEM_CAMERA_CAPABILITIES;
  const apertures = [...caps.apertures].sort((a, b) => a - b);
  const wb = caps.whiteBalance;
  const values: Record<Parameter, number> = {
    zoom: Math.round(context.zoom * 300),
    aperture: Math.max(0, apertures.indexOf(appliedTuning?.aperture ?? apertures[0])),
    whiteBalance: Math.max(0, wb.indexOf(appliedTuning?.whiteBalance === 'keep' ? 'auto' : appliedTuning?.whiteBalance ?? 'auto')),
    contrast: Math.round(((appliedTuning?.contrast ?? 1) - 0.8) * 100),
    flash: FLASH.indexOf(context.flash),
  };
  const max: Record<Parameter, number> = { zoom: 300, aperture: Math.max(0, apertures.length - 1), whiteBalance: Math.max(0, wb.length - 1), contrast: 40, flash: 2 };
  const available: Record<Parameter, boolean> = {
    zoom: true, aperture: caps.native && apertures.length > 1,
    whiteBalance: caps.native && wb.length > 1, contrast: caps.native && caps.contrast, flash: true,
  };
  const actual = values[selected];
  useEffect(() => { setDraft(actual); }, [visible, selected, actual, busy]);
  const format = (id: Parameter, value: number) => {
    switch (id) {
      case 'zoom': return `${(1 + value / 100).toFixed(2)}x`;
      case 'aperture': return apertures[value] ? `f/${apertures[value]}` : '自动';
      case 'whiteBalance': return WB_LABELS[wb[value]] ?? '自动';
      case 'contrast': return (0.8 + value / 100).toFixed(2);
      case 'flash': return FLASH_LABELS[value];
    }
  };
  const commit = (value: number) => {
    if (disabled || !available[selected]) return;
    const change: ManualCameraSettings = selected === 'zoom' ? { zoom: value / 300 }
      : selected === 'aperture' ? { aperture: apertures[value] }
      : selected === 'whiteBalance' ? { whiteBalance: wb[value] }
      : selected === 'contrast' ? { contrast: Number((0.8 + value / 100).toFixed(2)) }
      : { flash: FLASH[value] };
    void onChange(change);
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="关闭微调面板" style={styles.backdrop} onPress={onClose} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(20, insets.bottom) }]}>
          <View style={styles.handle} />
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <View style={styles.heading}>
              <View><Text style={styles.title}>相机微调</Text><Text style={styles.subtitle}>选择参数，左右拨动滚轮</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="完成微调" onPress={onClose} style={styles.done}><Text style={styles.doneText}>完成</Text></Pressable>
            </View>
            <View style={styles.tabs}>
              {PARAMETERS.map(item => <Pressable key={item.id} accessibilityRole="button"
                accessibilityState={{ selected: selected === item.id }} onPress={() => setSelected(item.id)}
                style={[styles.tab, selected === item.id && styles.tabSelected]}>
                <Text style={styles.tabLabel}>{item.label}</Text>
                <Text style={styles.tabValue} numberOfLines={1} adjustsFontSizeToFit>{item.id === 'contrast' && appliedTuning?.contrast == null ? '系统' : format(item.id, values[item.id])}</Text>
              </Pressable>)}
            </View>
            <View style={styles.readout}>
              <Text style={styles.value}>{format(selected, draft)}</Text>
              <Text style={styles.unit}>{PARAMETERS.find(item => item.id === selected)?.label}</Text>
            </View>
            <ParameterWheel key={selected} label={`${PARAMETERS.find(item => item.id === selected)?.label}滚轮`}
              value={draft} max={max[selected]} disabled={disabled || !available[selected]}
              valueText={format(selected, draft)} formatValue={value => format(selected, value)} onChange={setDraft} onCommit={commit} />
            <View style={styles.endpoints}><Text style={styles.endpoint}>减小</Text><Text style={styles.endpoint}>逐格微调 · 松手吸附</Text><Text style={styles.endpoint}>增大</Text></View>
            <View style={styles.feedback} accessibilityLiveRegion="polite">
              {busy ? <ActivityIndicator size="small" color={colors.secondary} /> : <Ionicons name="swap-horizontal-outline" size={16} color={colors.secondary} />}
              <Text style={styles.hint}>{!available[selected]
                ? selected === 'aperture' ? '当前镜头光圈固定，由系统管理。' : '当前相机不支持手动调整此参数。'
                : busy ? '正在应用参数…' : message}</Text>
            </View>
            <Text style={styles.note}>松手后应用到相机。手动微调后 AI 指导关闭，可按需重新开启。</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24,22,18,0.28)' },
  sheet: { maxHeight: '80%', width: '100%', maxWidth: 600, alignSelf: 'center', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, marginTop: 10 },
  content: { padding: 22 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.subtle, fontSize: 12, marginTop: 6 },
  done: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: colors.secondaryContainer, justifyContent: 'center' },
  doneText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 5, marginTop: 22 },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 3, borderRadius: 14, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: 'transparent' },
  tabSelected: { backgroundColor: colors.butterWarm, borderColor: colors.secondaryFixedDim },
  tabLabel: { textAlign: 'center', color: colors.muted, fontSize: 10 },
  tabValue: { textAlign: 'center', color: colors.ink, fontSize: 12, fontWeight: '600', marginTop: 6 },
  readout: { alignItems: 'center', marginTop: 26, gap: 4 },
  value: { color: colors.ink, fontSize: 32, fontWeight: '600', fontVariant: ['tabular-nums'] },
  unit: { color: colors.subtle, fontSize: 12 },
  wheelRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 18 },
  wheelStep: { width: 36, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.line },
  wheelControl: { flex: 1, height: 100, justifyContent: 'center' },
  wheelDrum: { height: 76, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#15130F', backgroundColor: '#26241F' },
  wheelGroove: { position: 'absolute', top: 0, bottom: 0, width: 64, marginLeft: -32, alignItems: 'center' },
  wheelRib: { position: 'absolute', top: 0, bottom: 0, width: 3, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.09)', borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.55)' },
  wheelTick: { position: 'absolute', top: 13, height: 10, width: 1, backgroundColor: '#8E8779' },
  wheelMajorTick: { height: 18, width: 2, backgroundColor: '#CEC4AD' },
  wheelSelectedTick: { backgroundColor: colors.secondaryContainer },
  wheelNumber: { position: 'absolute', top: 40, width: 64, textAlign: 'center', fontSize: 10, color: '#C9C0AC', fontVariant: ['tabular-nums'] },
  wheelSelectedNumber: { color: colors.secondaryContainer, fontWeight: '700' },
  wheelSelection: { position: 'absolute', left: '50%', top: 0, bottom: 0, backgroundColor: 'rgba(254,221,132,0.08)' },
  wheelShadeLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '25%' },
  wheelShadeRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '25%' },
  wheelPointer: { position: 'absolute', zIndex: 1, top: 1, left: '50%', marginLeft: -5, width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.secondary },
  wheelIndex: { position: 'absolute', bottom: 4, left: '50%', marginLeft: -1, width: 2, height: 8, borderRadius: 1, backgroundColor: colors.secondary },
  endpoints: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  endpoint: { color: colors.subtle, fontSize: 11 },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  hint: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 19 },
  note: { color: colors.subtle, fontSize: 11, lineHeight: 18, marginTop: 9 },
  disabled: { opacity: 0.35 },
});
