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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, shadows } from '../../constants/theme';
import { sampleAlbum } from '../../constants/data';
import { PageHeader } from '../ui/PageHeader';
import { useCaptureStore } from '../../store/captureStore';
import type { InspirationItem } from '../../types';

type Props = { capturedUri: string | null; savedUris: string[] };

export function AlbumPage({ capturedUri, savedUris }: Props) {
  const [selectedFilter, setSelectedFilter] = useState('全部');
  const [previewItem, setPreviewItem] = useState<InspirationItem | null>(null);
  const favoriteUris = useCaptureStore((state) => state.favoriteUris) || [];
  const toggleFavorite = useCaptureStore((state) => state.toggleFavorite);
  const filters = ['全部', '人像', '风景', '收藏'];

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

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <PageHeader title="我的相册" icon="options-outline" />

      {/* ── 极简小清新光影统计卡片 ── */}
      <View style={styles.statsCardWrapper}>
        <View style={styles.statsCard}>
          {/* 毛玻璃底层 */}
          <BlurView
            intensity={45}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              styles.cardBlur,
            ]}
          />

          {/* 清新晨露微光渐变 */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.92)',
              'rgba(240, 247, 245, 0.88)',
              'rgba(255, 255, 255, 0.95)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* 玻璃顶端微反光 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.80)', 'rgba(255, 255, 255, 0.0)']}
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
              <Text style={styles.count}>{filteredImages.length}</Text>
              <Text style={styles.suffix}>
                {selectedFilter === '收藏' ? '张收藏光影' : '张珍藏影像'}
              </Text>
            </View>

            <View style={styles.statsRight}>
              {/* 清新薄荷微徽章 */}
              <View style={styles.statsBadge}>
                <View style={[StyleSheet.absoluteFill, styles.badgeBg]} />
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.badgeBorder]} />
                <Ionicons name="sparkles-outline" size={13} color={colors.primary} />
                <Text style={styles.date}>今日胶卷已就绪</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── 小清新柔态胶囊筛选栏 ── */}
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
                  intensity={active ? 50 : 35}
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
                        ? 'rgba(45, 106, 148, 0.25)'
                        : 'rgba(255, 255, 255, 0.85)',
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

      {/* ── 照片网格与空状态 ── */}
      {filteredImages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons
              name={selectedFilter === '收藏' ? 'heart-dislike-outline' : 'images-outline'}
              size={36}
              color={colors.muted}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {selectedFilter === '收藏' ? '暂无收藏影像' : '暂无相关照片'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === '收藏'
              ? '点击照片右上角的小爱心，即可收藏喜欢的照片'
              : '切换其他分类或开始拍摄记录美好瞬间'}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredImages.map((item, index) => {
            const isFav = favoriteUris.includes(item.uri);
            return (
              <Pressable
                key={`${item.uri}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`查看照片 ${item.title}`}
                onPress={() => setPreviewItem(item)}
                style={({ pressed }) => [
                  styles.gridItem,
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <Image source={{ uri: item.uri }} style={styles.image} />
                <LinearGradient
                  colors={['transparent', 'rgba(20,30,38,0.45)']}
                  style={styles.imageOverlay}
                  pointerEvents="none"
                />
                {/* 照片边框 */}
                <View pointerEvents="none" style={styles.imageBorder} />

                {/* 爱心收藏按钮 */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isFav ? '取消收藏' : '加入收藏'}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.uri);
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.heartBadgeWrapper,
                    { transform: [{ scale: pressed ? 0.88 : 1 }] },
                  ]}
                >
                  <View style={[styles.heartBadge, isFav && styles.heartBadgeActive]}>
                    <BlurView
                      intensity={50}
                      tint="dark"
                      style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                    />
                    <View style={[StyleSheet.absoluteFill, isFav ? styles.heartBadgeBgActive : styles.heartBadgeBg]} />
                    <View
                      pointerEvents="none"
                      style={[
                        StyleSheet.absoluteFill,
                        styles.heartBadgeBorder,
                        isFav && styles.heartBadgeBorderActive,
                      ]}
                    />
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={13}
                      color={isFav ? '#FF4D4F' : colors.whiteWarm}
                    />
                  </View>
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── 照片大图预览 Modal ── */}
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
                    color={favoriteUris.includes(previewItem.uri) ? '#FF4D4F' : '#FFFFFF'}
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
    ...shadows.glassSm,
  },
  statsCard: {
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 22,
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
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  count: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
  },
  suffix: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  badgeBg: {
    borderRadius: 14,
    backgroundColor: 'rgba(45, 106, 148, 0.10)',
  },
  badgeBorder: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 148, 0.20)',
  },
  date: {
    color: colors.primary,
    fontSize: 11.5,
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
    backgroundColor: 'rgba(45, 106, 148, 0.12)',
  },
  pillInactiveBg: {
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  filterText: {
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: '600',
    zIndex: 2,
  },
  filterTextActive: {
    color: colors.primary,
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
    zIndex: 10,
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
  heartBadgeActive: {
    backgroundColor: 'rgba(255, 77, 79, 0.25)',
  },
  heartBadgeBgActive: {
    borderRadius: 13,
    backgroundColor: 'rgba(255, 77, 79, 0.4)',
  },
  heartBadgeBorderActive: {
    borderColor: 'rgba(255, 77, 79, 0.8)',
  },

  /* 空状态 */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(126, 155, 178, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 240,
  },

  /* 预览弹窗 */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 22, 0.94)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
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
    fontWeight: '700',
  },
  modalTag: {
    color: 'rgba(255, 255, 255, 0.65)',
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
