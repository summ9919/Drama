import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CompositionTarget } from '../../lib/compositionTarget';
import { TARGET_TOLERANCE } from '../../lib/compositionTarget';

type Props = { target: CompositionTarget | null; enabled: boolean; width: number; height: number };

// Shares the camera viewport: no extra frame, captions or opaque panels.
export function CameraDirectionOverlay({ target, enabled, width, height }: Props) {
  const cx = width / 2, cy = height / 2;
  const radius = Math.max(8, width * TARGET_TOLERANCE);
  const tx = Math.max(radius + 4, Math.min(width - radius - 4, (target?.x ?? 0.5) * width));
  const ty = Math.max(radius + 4, Math.min(height - radius - 4, (target?.y ?? 0.5) * height));
  const dx = tx - cx, dy = ty - cy;
  const length = Math.hypot(dx, dy);
  const dashes = Math.max(0, Math.floor((length - radius - 12) / 12));
  const color = target?.phase === 'ready' ? '#7FF0BE' : '#D7FFF0';
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {enabled && target && <>
      {Array.from({ length: dashes }, (_, index) => {
        const distance = 12 + index * 12;
        return <View key={index} style={[styles.dash, {
          left: cx + dx / length * distance - 3, top: cy + dy / length * distance - 1,
          backgroundColor: color, transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
        }]} />;
      })}
      <View testID="composition-target" style={[styles.target, {
        left: tx - radius, top: ty - radius, width: radius * 2, height: radius * 2,
        borderRadius: radius, borderColor: color,
      }]} />
    </>}
    <View testID="composition-center" style={[styles.dot, { left: cx - 4, top: cy - 4, backgroundColor: enabled ? color : '#FFFFFF99' }]} />
  </View>;
}

const styles = StyleSheet.create({
  dash: { position: 'absolute', width: 6, height: 2, borderRadius: 1 },
  target: { position: 'absolute', borderWidth: 2 },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#142A2466' },
});
