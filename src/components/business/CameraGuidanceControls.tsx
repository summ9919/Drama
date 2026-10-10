import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GuidanceStatus } from '../../types/guidance';

type Props = {
  enabled: boolean; starting: boolean; disabled: boolean; autoZoom: boolean;
  status: GuidanceStatus; configMissing: boolean;
  onToggle: () => void; onAutoZoom: () => void; onRefresh: () => void; onConfigure: () => void;
};

export function CameraGuidanceControls(props: Props) {
  const working = props.starting || props.status.phase === 'sampling' || props.status.phase === 'analyzing';
  return <View style={styles.container}>
    <View style={styles.row}>
      <Pressable accessibilityRole="switch" accessibilityLabel="AI 拍摄指导" accessibilityState={{ checked: props.enabled }}
        disabled={props.disabled || props.starting} onPress={props.onToggle} style={[styles.button, props.enabled && styles.selected]}>
        {working ? <ActivityIndicator size="small" color="#BCF5E4" /> : <Ionicons name="sparkles-outline" size={16} color={props.enabled ? '#BCF5E4' : '#D4E1EA'} />}
        <Text style={styles.text}>{props.starting ? '连接中' : `AI 指导${props.enabled ? ' 开' : ' 关'}`}</Text>
      </Pressable>
      <Pressable accessibilityRole="switch" accessibilityLabel="自动变焦" accessibilityState={{ checked: props.autoZoom }}
        disabled={props.disabled} onPress={props.onAutoZoom} style={[styles.button, props.autoZoom && styles.selected]}>
        <Ionicons name="scan-outline" size={16} color={props.autoZoom ? '#BCF5E4' : '#D4E1EA'} />
        <Text style={styles.text}>自动变焦{props.autoZoom ? ' 开' : ' 关'}</Text>
      </Pressable>
      {props.enabled && <Pressable accessibilityRole="button" accessibilityLabel="重新规划" disabled={props.disabled || working}
        onPress={props.onRefresh} style={styles.button}><Ionicons name="refresh-outline" size={18} color="#D4E1EA" /><Text style={styles.text}>重新规划</Text></Pressable>}
    </View>
    {(props.enabled || props.status.phase === 'error') && <Text testID="guidance-request-status" accessibilityLiveRegion="polite"
      style={props.status.phase === 'error' ? styles.error : styles.status}>{props.status.message}</Text>}
    {props.configMissing && <Pressable accessibilityRole="button" onPress={props.onConfigure} style={styles.configButton}>
      <Text style={styles.configText}>前往 AI 配置</Text>
    </Pressable>}
  </View>;
}

const styles = StyleSheet.create({
  container: { marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  button: { minHeight: 34, paddingHorizontal: 12, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1D2A34CC' },
  selected: { backgroundColor: '#28453DD9' },
  refresh: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1D2A34CC' },
  text: { fontSize: 12, color: '#E5EEE9', fontWeight: '500' },
  error: { fontSize: 11, lineHeight: 16, textAlign: 'center', color: '#F5C5AD', marginTop: 6, backgroundColor: '#141E26E6', borderRadius: 8, padding: 6 },
  status: { fontSize: 10, lineHeight: 14, textAlign: 'center', color: '#AFC3BB', marginTop: 4 },
  configButton: { alignSelf: 'center', minHeight: 32, justifyContent: 'center', paddingHorizontal: 12 },
  configText: { color: '#F3DFB5', fontSize: 12 },
});
