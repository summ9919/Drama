import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows } from '../../constants/theme';
import { inspirationImages } from '../../constants/data';
import { PageHeader } from '../ui/PageHeader';

type Props = { onStartCamera: () => void };

export function InspirationPage({ onStartCamera }: Props) {
  const [category, setCategory] = useState('全部');
  const columns = [
    inspirationImages.filter((_, index) => index % 2 === 0),
    inspirationImages.filter((_, index) => index % 2 === 1),
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.fixedHeader}>
        <PageHeader title="灵感" icon="camera-outline" onPress={onStartCamera} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>别急着按下快门，先看看光想把你带到哪里。</Text>

        <View style={styles.segmentRow}>
          {['全部', '人像', '风景', '夜景'].map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategory(item)}
                style={({ pressed }) => [
                  styles.segment,
                  active ? styles.segmentActive : styles.segmentIdle,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.grid}>
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={styles.column}>
              {column.map((item, index) => (
                <Pressable
                  key={item.title}
                  style={({ pressed }) => [
                    styles.cardWrapper,
                    columnIndex === 1 && index === 0 && styles.cardTallWrapper,
                    columnIndex === 0 && index === 2 && styles.cardTallWrapper,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={onStartCamera}
                >
                  <View style={styles.card}>
                    <Image source={{ uri: item.uri }} style={styles.image} />
                    <LinearGradient
                      colors={['transparent', 'rgba(24, 22, 18, 0.52)']}
                      style={styles.overlay}
                      pointerEvents="none"
                    />
                    <View pointerEvents="none" style={styles.cardBorder} />

                    <View style={styles.labelContainer}>
                      <Text style={styles.title}>{item.title}</Text>
                      <View style={styles.tagRow}>
                        <View style={styles.tagDot} />
                        <Text style={styles.tag}>{item.tag}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: 'rgba(251, 249, 246, 0.92)',
    zIndex: 100,
    borderBottomWidth: 1,
    borderColor: 'rgba(45, 42, 38, 0.04)',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  lead: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  segment: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    ...shadows.glassSm,
  },
  segmentIdle: {
    backgroundColor: colors.surfaceContainer,
  },
  segmentText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  segmentTextActive: {
    color: colors.whiteWarm,
  },

  grid: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
    height: 215,
    borderRadius: 24,
    ...shadows.glassMd,
  },
  cardTallWrapper: {
    height: 255,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.80)',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  title: {
    color: colors.whiteWarm,
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.butter,
  },
  tag: {
    color: 'rgba(251, 249, 246, 0.86)',
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
