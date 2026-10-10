import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function useReadyPulse(active: boolean) {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduceMotion(value); }).catch(() => undefined);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { alive = false; listener.remove(); };
  }, []);
  useEffect(() => {
    pulse.setValue(0);
    if (!active || reduceMotion) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [active, reduceMotion, pulse]);
  return pulse;
}

// Only thin strokes inside the viewfinder: no filled panels over the photograph.
export function CameraReadyFrame({ active, width, height }: { active: boolean; width: number; height: number }) {
  const pulse = useReadyPulse(active);
  if (!active) return null;
  return <View testID="camera-ready-frame" pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) }]}>
      {(['tl', 'tr', 'bl', 'br'] as const).map(corner => <View key={corner} style={[styles.corner, styles[corner]]} />)}
    </Animated.View>
    <Animated.View style={[styles.lockRing, { left: width / 2 - 25, top: height / 2 - 25,
      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0.15] }),
      transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
    }]} />
  </View>;
}

export function CameraReadyNotice({ active, message }: { active: boolean; message: string }) {
  useEffect(() => { if (active) Vibration.vibrate(25); }, [active]);
  return <View style={styles.noticeSlot}>
    {active ? <View testID="camera-ready-notice" accessible accessibilityLabel="可以拍照了，已完成本地对准" accessibilityLiveRegion="polite" style={styles.notice}>
      <View style={styles.check}><Ionicons name="checkmark" size={23} color="#102D24" /></View>
      <View><Text style={styles.readyTitle}>可以拍照了</Text><Text style={styles.readyDetail}>构图已对准 · 按下快门定格</Text></View>
      <View style={styles.readyDot} />
    </View> : <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>}
  </View>;
}

export function CameraShutterHalo({ active }: { active: boolean }) {
  const pulse = useReadyPulse(active);
  if (!active) return null;
  return <Animated.View pointerEvents="none" style={[styles.shutterHalo, {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
  }]} />;
}

const styles = StyleSheet.create({
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#83FFD0', shadowColor: '#70F9C2', shadowOpacity: 0.7, shadowRadius: 7 },
  tl: { top: 3, left: 3, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  tr: { top: 3, right: 3, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  bl: { bottom: 3, left: 3, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  br: { bottom: 3, right: 3, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  lockRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#83FFD0' },
  noticeSlot: { minHeight: 32, justifyContent: 'center', marginBottom: 4 },
  notice: { height: 48, borderRadius: 16, backgroundColor: '#203F35', borderWidth: 1, borderColor: '#72E6B77A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  check: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#89F5CB', alignItems: 'center', justifyContent: 'center' },
  readyTitle: { color: '#DFFFF0', fontSize: 18, fontWeight: '800', letterSpacing: 1.5 },
  readyDetail: { color: '#A7D9C2', fontSize: 10, marginTop: 1 },
  readyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#89F5CB', marginLeft: 6 },
  message: { color: '#BCD3CB', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  shutterHalo: { position: 'absolute', width: 78, height: 78, borderRadius: 39, borderWidth: 1.5, borderColor: '#83FFD0' },
});
