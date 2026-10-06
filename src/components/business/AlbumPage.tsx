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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadows } from '../../constants/theme';
import { sampleAlbum } from '../../constants/data';
import { PageHeader } from '../ui/PageHeader';
import type { InspirationItem } from '../../types';

type Props = { capturedUri: string | null; savedUris: string[] };

export function AlbumPage({ capturedUri, savedUris }: Props) {
  const [selectedFilter, setSelectedFilter] = useState('全部');
  const filters = ['全部', '人像', '风景', '收藏'];

  const localImages: InspirationItem[] = [
    ...savedUris,
    ...(capturedUri ? [capturedUri] : []),
  ].map((uri) => ({ uri, title: '我的作品', tag: '本地作品' }));
  const images = localImages.length ? localImages : sampleAlbum;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <PageHeader title="我的相册" icon="options-outline" />

      {/* ── Apple 雾态统计大卡片 (Mist Blue Butter 调色) ── */}
      <View style={styles.statsCardWrapper}>
        <View style={styles.statsCard}>
          {/* 毛玻璃底层 */}
          <BlurView
            intensity={55}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              styles.cardBlur,
            ]}
          />

          {/* 雾蓝黄油微渐变 */}
          <LinearGradient
            colors={[
              'rgba(126, 155, 178, 0.90)',
              'rgba(184, 201, 214, 0.85)',
              'rgba(243, 223, 181, 0.82)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* 玻璃顶端微反光 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={[StyleSheet.absoluteFill, styles.sheen]}
            pointerEvents="none"
          />

          {/* 边缘微光描边 */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.statsBorder]} />

          {/* 卡片内容 */}
          <View style={styles.statsContent}>
            <View>
              <Text style={styles.count}>{images.length}</Text>
              <Text style={styles.suffix}>张珍藏影像</Text>
            </View>

            <View style={styles.statsRight}>
              {/* Apple 玻璃微徽章 */}
              <View style={styles.statsBadge}>
                <BlurView
                  intensity={40}
                  tint="light"
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <View style={[StyleSheet.absoluteFill, styles.badgeBg]} />
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.badgeBorder]} />
                <Ionicons name="time-outline" size={13} color={colors.whiteWarm} />
                <Text style={styles.date}>最近更新 · 今天</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Apple 雾态胶囊筛选栏 ── */}
      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = selectedFilter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setSelectedFilter(item)}
              style={({ pressed }) => [
                styles.filterPillWrapper,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
            >
              <View style={styles.filterPill}>
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
                    active ? styles.pillActiveBg : styles.pillInactiveBg,
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
                        : 'rgba(255, 255, 255, 0.7)',
                    },
                  ]}
                />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ── 照片网格 ── */}
      <View style={styles.grid}>
        {images.map((item, index) => (
          <View key={`${item.uri}-${index}`} style={styles.gridItem}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(20,30,38,0.4)']}
              style={styles.imageOverlay}
              pointerEvents="none"
            />
            {/* 照片边框 */}
            <View pointerEvents="none" style={styles.imageBorder} />

            {/* Apple 雾态爱心徽标 */}
            <View style={styles.heartBadgeWrapper}>
              <View style={styles.heartBadge}>
                <BlurView
                  intensity={50}
                  tint="dark"
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <View style={[StyleSheet.absoluteFill, styles.heartBadgeBg]} />
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.heartBadgeBorder]} />
                <Ionicons name="heart-outline" size={12} color={colors.whiteWarm} />
              </View>
            </View>
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

  /* 统计卡片 */
  statsCardWrapper: {
    marginTop: 22,
    borderRadius: 26,
    ...shadows.glassPrimaryGlow,
  },
  statsCard: {
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 24,
    paddingHorizontal: 22,
  },
  cardBlur: {
    borderRadius: 26,
  },
  sheen: {
    maxHeight: 36,
  },
  statsBorder: {
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.88)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  count: {
    color: colors.whiteWarm,
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '600',
  },
  suffix: {
    color: 'rgba(254, 253, 251, 0.88)',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  badgeBg: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  badgeBorder: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  date: {
    color: colors.whiteWarm,
    fontSize: 11,
    fontWeight: '600',
  },

  /* 筛选 */
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 6,
  },
  filterPillWrapper: {
    borderRadius: 18,
    ...shadows.glassSm,
  },
  filterPill: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBlur: {
    borderRadius: 18,
  },
  pillActiveBg: {
    borderRadius: 18,
    backgroundColor: 'rgba(126, 155, 178, 0.25)',
  },
  pillInactiveBg: {
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
  },
  filterText: {
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: '600',
    zIndex: 2,
  },
  filterTextActive: {
    color: colors.ink,
    fontWeight: '700',
  },

  /* 网格 */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 0.82,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.paleMist,
    position: 'relative',
    ...shadows.glassSm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  imageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  heartBadgeWrapper: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: 13,
  },
  heartBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartBadgeBg: {
    borderRadius: 13,
    backgroundColor: 'rgba(20, 30, 38, 0.42)',
  },
  heartBadgeBorder: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
