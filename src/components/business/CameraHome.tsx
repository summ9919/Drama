import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../../constants/theme';
import { editorialShots } from '../../constants/data';
import { IconButton } from '../ui/IconButton';
import { PrimaryButton } from '../ui/PrimaryButton';
import { RainbowBrand } from '../ui/RainbowBrand';
import { CardSurface } from '../ui/CardSurface';

type Props = {
  permissionGranted: boolean;
  onOpenCamera: () => void;
};

export function CameraHome({ permissionGranted, onOpenCamera }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── 顶部官方品牌 Logo 栏 ── */}
      <View style={styles.brandRow}>
        <RainbowBrand />
        <IconButton
          icon="sparkles-outline"
          onPress={() => Alert.alert('今日光影提示', '慢一点按下快门，先观察光线如何拂过被摄物的轮廓。')}
        />
      </View>

      {/* ── 核心一体化时尚取景器卡片 ── */}
      <View style={styles.heroCardWrapper}>
        <CardSurface
          radius={26}
          borderWidth={1.2}
          borderColor="rgba(255, 255, 255, 0.75)"
          style={styles.heroCardSurface}
          contentStyle={styles.heroCardContent}
        >
          {/* 取景器动态演示画面 */}
          <View style={styles.viewfinderFrame}>
            <Image
              source={require('../../../assets/drama-mobile-feature-banner.gif')}
              style={styles.heroBanner}
              resizeMode="cover"
              accessible
              accessibilityLabel="Drama相机功能展示"
            />

            {/* 极简取景器辅助标记 */}
            <View pointerEvents="none" style={styles.viewfinderOverlay}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

              {/* 取景器光标状态药丸 */}
              <View style={styles.lensPill}>
                <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.lensPillDot} />
                <Text style={styles.lensPillText}>AI 构图指引 · 实时就绪</Text>
              </View>
            </View>
          </View>

          {/* 底部行动与说明区 */}
          <View style={styles.heroActionArea}>
            <View style={styles.heroHeadlineBlock}>
              <Text style={styles.heroKicker}>NATURAL LIGHT & COMPOSITION</Text>
              <Text style={styles.heroTitle}>
                让日常随拍，拥有电影般的<Text style={styles.heroTitleHighlight}>呼吸感</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                AI 实时机位指引 · 胶片预设色调 · 细腻光影感知
              </Text>
            </View>

            <View style={styles.heroButtonWrapper}>
              <PrimaryButton
                label={permissionGranted ? '进入取景器' : '开启相机'}
                onPress={onOpenCamera}
                variant="primary"
                icon={permissionGranted ? 'camera-outline' : 'sparkles-outline'}
              />
            </View>
          </View>
        </CardSurface>
      </View>

      {/* ── 三大特性小清新方块 ── */}
      <View style={styles.featureRow}>
        <FeatureCard
          icon="compass-outline"
          title="实时指导"
          body="机位 · 焦段 · 光线"
          accent="rgba(45, 117, 101, 0.12)"
          iconColor={colors.primary}
        />
        <FeatureCard
          icon="color-palette-outline"
          title="一键风格"
          body="6 种清透预设"
          accent="rgba(143, 174, 197, 0.20)"
          iconColor="#45738E"
        />
        <FeatureCard
          icon="albums-outline"
          title="本地保存"
          body="每份灵感都留住"
          accent="rgba(245, 222, 179, 0.35)"
          iconColor="#8A6D34"
        />
      </View>

      {/* ── 今日灵感：时尚大片横滑画廊 ── */}
      <View style={styles.editorialSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日光影灵感</Text>
          <Text style={styles.sectionSubtitle}>滑动探索构图预设</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.editorialScroll}
          decelerationRate="fast"
          snapToInterval={284}
          snapToAlignment="start"
        >
          {editorialShots.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.editorialCardWrapper,
                { transform: [{ scale: pressed ? 0.985 : 1 }] },
              ]}
              onPress={onOpenCamera}
            >
              <View style={styles.editorialCard}>
                {/* 3:4 比例大片 */}
                <Image source={item.image} style={styles.editorialImage} />

                {/* 边缘微光反光描边 */}
                <View pointerEvents="none" style={styles.cardBorderOverlay} />

                {/* 极简雾态小药丸标签 */}
                <View style={styles.minimalGlassTag}>
                  <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
                  <View style={styles.tagGlassBg} />
                  <View pointerEvents="none" style={styles.tagBorder} />
                  <Text style={styles.tagTitleText}>{item.title}</Text>
                  <Text style={styles.tagMetaText}>· {item.meta}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

/* ── Feature 雾态卡片组件 ── */
function FeatureCard({
  icon,
  title,
  body,
  accent,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  accent: string;
  iconColor?: string;
}) {
  return (
    <CardSurface
      radius={20}
      borderWidth={1.1}
      borderColor="rgba(255, 255, 255, 0.65)"
      style={styles.featureItemWrapper}
      contentStyle={styles.featureItem}
    >
      <View style={[styles.featureIconBg, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={20} color={iconColor ?? colors.ink} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureBody}>{body}</Text>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 95,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    zIndex: 10,
  },

  /* 核心取景器一体化卡片 */
  heroCardWrapper: {
    marginTop: 16,
    ...shadows.glassMd,
  },
  heroCardSurface: {
    borderRadius: 26,
  },
  heroCardContent: {
    padding: 12,
  },
  viewfinderFrame: {
    width: '100%',
    aspectRatio: 1.85,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E4ECF0',
  },
  heroBanner: {
    width: '100%',
    height: '100%',
  },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
  },
  lensPill: {
    position: 'absolute',
    top: 10,
    left: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 9,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 22, 28, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  lensPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3ECF8E',
  },
  lensPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* 底部操作区 */
  heroActionArea: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  heroHeadlineBlock: {
    alignItems: 'center',
  },
  heroKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  heroTitleHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  heroButtonWrapper: {
    width: '100%',
    marginTop: 16,
  },

  /* 三大特性卡片 */
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  featureItemWrapper: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'transparent',
    ...shadows.glassSm,
  },
  featureItem: {
    flexGrow: 1,
    padding: 13,
    paddingTop: 14,
    minHeight: 118,
  },
  featureIconBg: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  featureTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  featureBody: {
    color: colors.muted,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3,
  },

  /* 今日灵感展区 */
  editorialSection: {
    marginTop: 26,
    marginHorizontal: -20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    color: colors.subtle,
    fontSize: 11.5,
    fontWeight: '500',
  },
  editorialScroll: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 14,
  },
  editorialCardWrapper: {
    width: 270,
    height: 360,
    borderRadius: 22,
    ...shadows.glassMd,
  },
  editorialCard: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.paleMist,
  },
  editorialImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  minimalGlassTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.glassSm,
  },
  tagGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
  },
  tagBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  tagTitleText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tagMetaText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 3,
  },
});
