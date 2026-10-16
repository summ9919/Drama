import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
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
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <PageHeader title="灵感" icon="camera-outline" onPress={onStartCamera} />
      <Text style={styles.lead}>别急着按下快门，先看看光想把你带到哪里。</Text>

      {/* ── Apple 雾态分类胶囊栏 ── */}
      <View style={styles.segmentRow}>
        {['全部', '人像', '风景', '夜景'].map((item) => {
          const active = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={({ pressed }) => [
                styles.segmentWrapper,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
            >
              <View style={styles.segment}>
                <BlurView
                  intensity={active ? 60 : 40}
                  tint="light"
                  style={[
                    StyleSheet.absoluteFill,
                    styles.pillBlur,
                  ]}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    active ? styles.segmentActiveBg : styles.segmentInactiveBg,
                  ]}
                />
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 18,
                      borderWidth: 1.1,
                      borderColor: active
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(255, 255, 255, 0.72)',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {item}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ── 瀑布流卡片 ── */}
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
                    colors={['transparent', 'rgba(20,30,38,0.34)']}
                    style={styles.overlay}
                    pointerEvents="none"
                  />
                  <View pointerEvents="none" style={styles.cardBorder} />

                  {/* 图片上的轻量文字层，不使用独立背景块 */}
                  <View style={styles.labelContainer}>
                    <View style={styles.labelContent}>
                      <Text style={styles.title}>{item.title}</Text>
                      <View style={styles.tagRow}>
                        <View style={styles.tagDot} />
                        <Text style={styles.tag}>{item.tag}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },
  lead: {
    color: colors.muted,
    fontSize: 13.5,
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  /* 胶囊筛选 */
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  segmentWrapper: {
    borderRadius: 18,
    ...shadows.glassSm,
  },
  segment: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 7.5,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBlur: {
    borderRadius: 18,
  },
  segmentActiveBg: {
    borderRadius: 18,
    backgroundColor: 'rgba(45, 106, 148, 0.12)',
  },
  segmentInactiveBg: {
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  segmentText: {
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: '500',
    zIndex: 2,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  /* 瀑布流 */
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
    borderRadius: 22,
    ...shadows.glassMd,
  },
  cardTallWrapper: {
    height: 255,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.paleMist,
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
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },

  /* 直接叠加在图片上的文字 */
  labelContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  labelContent: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    zIndex: 2,
  },
  title: {
    color: colors.whiteWarm,
    fontSize: 13.5,
    fontWeight: '700',
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
    color: 'rgba(254, 253, 251, 0.85)',
    fontSize: 10.5,
    fontWeight: '500',
  },
});
