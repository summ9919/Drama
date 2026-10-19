import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { BrandIcon } from '../ui/BrandIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadows } from '../../constants/theme';
import { sampleAlbum } from '../../constants/data';
import { PageHeader } from '../ui/PageHeader';
import { useCaptureStore } from '../../store/captureStore';
import type { InspirationItem } from '../../types';

type Props = { capturedUri: string | null; savedUris: string[] };

type FilterItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const filters: FilterItem[] = [
  { key: '全部', label: '全部照片', icon: 'sparkles-outline' },
  { key: '人像', label: '人像胶片', icon: 'person-outline' },
  { key: '风景', label: '风景影像', icon: 'leaf-outline' },
  { key: '收藏', label: '我的收藏', icon: 'heart-outline' },
];

const SCORES = [9.8, 9.4, 9.6, 9.1, 9.5, 9.3];

const scoreFor = (index: number) => SCORES[index % SCORES.length];

export function AlbumPage({ capturedUri, savedUris }: Props) {
  const [selectedFilter, setSelectedFilter] = useState('全部');
  const [previewItem, setPreviewItem] = useState<InspirationItem | null>(null);
  const favoriteUris = useCaptureStore((state) => state.favoriteUris) || [];
  const toggleFavorite = useCaptureStore((state) => state.toggleFavorite);

  const localImages: InspirationItem[] = [
    ...savedUris,
    ...(capturedUri ? [capturedUri] : []),
  ].map((uri) => ({ uri, title: '我的作品', tag: '本地作品' }));
  const images = localImages.length ? localImages : sampleAlbum;

  const filteredImages = images.filter((item) => {
    if (selectedFilter === '全部') return true;
    if (selectedFilter === '收藏') {
      return favoriteUris.includes(item.uri);
    }
    if (selectedFilter === '人像') {
      return (item.tag && item.tag.includes('人像')) || (item.title && item.title.includes('人像'));
    }
    if (selectedFilter === '风景') {
      return (
        (item.tag && (item.tag.includes('风景') || item.tag.includes('自然') || item.tag.includes('夜景'))) ||
        (item.title && (item.title.includes('风景') || item.title.includes('自然') || item.title.includes('黄昏') || item.title.includes('日落')))
      );
    }
    return true;
  });

  const heroItem = filteredImages[0];
  const galleryImages = filteredImages.slice(1);

  return (
    <View style={styles.screen}>
      <View style={styles.fixedHeader}>
        <PageHeader title="相册" icon="options-outline" />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── 筛选胶囊 ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {filters.map((item) => {
            const active = selectedFilter === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedFilter(item.key)}
                style={({ pressed }) => [
                  styles.filterPill,
                  active ? styles.filterPillActive : styles.filterPillIdle,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={active ? colors.whiteWarm : colors.secondary}
                />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredImages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name={selectedFilter === '收藏' ? 'heart-dislike-outline' : 'images-outline'}
                size={34}
                color={colors.subtle}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedFilter === '收藏' ? '暂无收藏影像' : '暂无相关照片'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === '收藏'
                ? '点击照片上的小爱心，即可收藏喜欢的照片'
                : '切换其他分类或开始拍摄记录美好瞬间'}
            </Text>
          </View>
        ) : (
          <>
            {/* ── 今日最佳作品 ── */}
            {heroItem && (
              <View style={styles.heroSection}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionTitleLeft}>
                    <Ionicons name="star" size={19} color={colors.secondary} />
                    <Text style={styles.sectionTitle}>今日最佳作品</Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillText}>Score: {scoreFor(0)} 卓越</Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`查看照片 ${heroItem.title}`}
                  onPress={() => setPreviewItem(heroItem)}
                  style={({ pressed }) => [
                    styles.heroCard,
                    { transform: [{ scale: pressed ? 0.99 : 1 }] },
                  ]}
                >
                  <Image source={{ uri: heroItem.uri }} style={styles.heroImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(24, 22, 18, 0.18)', 'rgba(24, 22, 18, 0.82)']}
                    locations={[0.25, 0.55, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />

                  <View style={styles.heroBadges}>
                    <View style={styles.glassBadge}>
                      <View style={styles.badgeDot} />
                      <Text style={styles.glassBadgeText}>构图评分: {scoreFor(0)}</Text>
                    </View>
                    <View style={styles.glassBadge}>
                      <Ionicons name="sunny-outline" size={13} color={colors.secondary} />
                      <Text style={styles.glassBadgeText}>光影平衡: A+</Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={favoriteUris.includes(heroItem.uri) ? '取消收藏' : '收藏照片'}
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleFavorite(heroItem.uri);
                    }}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.heroHeart,
                      { transform: [{ scale: pressed ? 0.9 : 1 }] },
                    ]}
                  >
                    <Ionicons
                      name={favoriteUris.includes(heroItem.uri) ? 'heart' : 'heart-outline'}
                      size={19}
                      color={favoriteUris.includes(heroItem.uri) ? '#BA1A1A' : colors.primary}
                    />
                  </Pressable>

                  <View style={styles.heroMeta}>
                    <View style={styles.heroMetaRow}>
                      <View style={styles.heroMetaText}>
                        <Text style={styles.heroTitle} numberOfLines={1}>{heroItem.title}</Text>
                        <Text style={styles.heroSubtitle} numberOfLines={1}>
                          {heroItem.tag ?? '35mm · 人像'}
                        </Text>
                      </View>
                      <View style={styles.tunePill}>
                        <Ionicons name="options-outline" size={14} color={colors.onSecondaryContainer} />
                        <Text style={styles.tunePillText}>微调</Text>
                      </View>
                    </View>
                    <View style={styles.heroExifRow}>
                      {['ƒ/2.0', '1/320s', 'ISO 80'].map((value) => (
                        <View key={value} style={styles.exifChip}>
                          <Text style={styles.exifText}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Pressable>
              </View>
            )}

            {/* ── 时光画廊 ── */}
            <View style={styles.gallerySection}>
              <View style={styles.galleryHeader}>
                <View style={styles.galleryTitleRow}>
                  <Text style={styles.galleryTitle}>时光画廊</Text>
                  <Text style={styles.galleryCount}>共 {filteredImages.length} 张原图</Text>
                </View>
                <View style={styles.gallerySort}>
                  <Text style={styles.gallerySortText}>按周聚类</Text>
                  <Ionicons name="chevron-down" size={15} color={colors.onSurfaceVariant} />
                </View>
              </View>

              <View style={styles.grid}>
                {galleryImages.map((item, index) => {
                  const isFav = favoriteUris.includes(item.uri);
                  const score = scoreFor(index + 1);
                  return (
                    <Pressable
                      key={`${item.uri}-${index}`}
                      accessibilityRole="button"
                      accessibilityLabel={`查看照片 ${item.title}`}
                      onPress={() => setPreviewItem(item)}
                      style={({ pressed }) => [
                        styles.gridCard,
                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                      ]}
                    >
                      <View style={styles.gridImageWrap}>
                        <Image source={{ uri: item.uri }} style={styles.gridImage} />
                        <LinearGradient
                          colors={['transparent', 'rgba(24, 22, 18, 0.48)']}
                          style={styles.gridGradient}
                          pointerEvents="none"
                        />

                        <View style={styles.scoreChip}>
                          <Text style={styles.scoreChipText}>{score}</Text>
                        </View>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={isFav ? '取消收藏' : '加入收藏'}
                          onPress={(event) => {
                            event.stopPropagation();
                            toggleFavorite(item.uri);
                          }}
                          hitSlop={8}
                          style={({ pressed }) => [
                            styles.gridHeart,
                            isFav && styles.gridHeartActive,
                            { transform: [{ scale: pressed ? 0.88 : 1 }] },
                          ]}
                        >
                          <Ionicons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={13}
                            color={isFav ? '#BA1A1A' : colors.whiteWarm}
                          />
                        </Pressable>

                        <View style={styles.tagChip}>
                          {index % 2 === 0 ? <BrandIcon size={14} /> : <Ionicons
                            name="crop-outline"
                            size={11}
                            color={colors.secondary}
                          />}
                          <Text style={styles.tagChipText} numberOfLines={1}>
                            {item.tag ?? 'AI 辅助构图'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.gridMeta}>
                        <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.gridSubtitle} numberOfLines={1}>
                          {index % 3 === 0 ? '50mm · 微距' : index % 3 === 1 ? '16mm · 超广' : '28mm · 夜景'}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── 照片大图预览 ── */}
      <Modal
        visible={previewItem !== null}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setPreviewItem(null)}
      >
        {previewItem && (
          <View style={styles.modalBackdrop}>
            <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
              <View style={styles.modalHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="关闭预览"
                  onPress={() => setPreviewItem(null)}
                  style={styles.modalBtn}
                >
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </Pressable>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {previewItem.title}
                  </Text>
                  {Boolean(previewItem.tag) && (
                    <Text style={styles.modalTag} numberOfLines={1}>
                      {previewItem.tag}
                    </Text>
                  )}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={favoriteUris.includes(previewItem.uri) ? '取消收藏' : '收藏照片'}
                  onPress={() => toggleFavorite(previewItem.uri)}
                  style={styles.modalBtn}
                >
                  <Ionicons
                    name={favoriteUris.includes(previewItem.uri) ? 'heart' : 'heart-outline'}
                    size={22}
                    color={favoriteUris.includes(previewItem.uri) ? '#FF8A80' : '#FFFFFF'}
                  />
                </Pressable>
              </View>

              <Pressable
                style={styles.modalImageWrap}
                onPress={() => setPreviewItem(null)}
              >
                <Image
                  source={{ uri: previewItem.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </Pressable>

              <View style={styles.modalFooter}>
                <Text style={styles.modalFooterText}>
                  {favoriteUris.includes(previewItem.uri) ? '已收藏 · 归类在“收藏”中' : '点击右上角心形收藏此照片'}
                </Text>
              </View>
            </SafeAreaView>
          </View>
        )}
      </Modal>
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
    paddingTop: 12,
    paddingBottom: 110,
  },

  /* ── filter pills ── */
  filterScroll: {
    marginHorizontal: -16,
    marginBottom: 20,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    ...shadows.glassSm,
  },
  filterPillIdle: {
    backgroundColor: colors.surfaceContainer,
  },
  filterText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  filterTextActive: {
    color: colors.whiteWarm,
  },

  /* ── best work ── */
  heroSection: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  scorePill: {
    backgroundColor: 'rgba(255, 224, 142, 0.5)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scorePillText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  heroCard: {
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
    ...shadows.glassMd,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: '82%',
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(251, 249, 246, 0.86)',
    ...shadows.glassSm,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  glassBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  heroHeart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 249, 246, 0.86)',
    ...shadows.glassSm,
  },
  heroMeta: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroMetaText: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  heroSubtitle: {
    color: 'rgba(228, 226, 223, 0.9)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tunePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.secondaryFixed,
    ...shadows.glassSm,
  },
  tunePillText: {
    color: colors.onSecondaryContainer,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroExifRow: {
    flexDirection: 'row',
    gap: 6,
  },
  exifChip: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  exifText: {
    color: 'rgba(234, 232, 229, 0.95)',
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  /* ── gallery ── */
  gallerySection: {
    marginBottom: 12,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  galleryTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  galleryTitle: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  galleryCount: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '400',
  },
  gallerySort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gallerySortText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48.2%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
    ...shadows.glassSm,
  },
  gridImageWrap: {
    width: '100%',
    aspectRatio: 4 / 5,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  scoreChip: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: 'rgba(24, 22, 18, 0.42)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  gridHeart: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 22, 18, 0.40)',
  },
  gridHeartActive: {
    backgroundColor: 'rgba(251, 249, 246, 0.90)',
  },
  tagChip: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
  },
  tagChipText: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  gridMeta: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    gap: 1,
  },
  gridTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  gridSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  /* ── empty ── */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 250,
  },

  /* ── preview modal ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 15, 0.94)',
  },
  modalSafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    zIndex: 10,
  },
  modalBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleBlock: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTag: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: 12,
    marginTop: 2,
  },
  modalImageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalFooter: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalFooterText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
  },
});
