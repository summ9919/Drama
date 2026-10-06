import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadows } from '../../constants/theme';
import { editorialShots } from '../../constants/data';
import { IconButton } from '../ui/IconButton';
import { PrimaryButton } from '../ui/PrimaryButton';
import { RainbowBrand } from '../ui/RainbowBrand';

type Props = {
  permissionGranted: boolean;
  onOpenCamera: () => void;
};

export function CameraHome({ permissionGranted, onOpenCamera }: Props) {
  const kickerText = permissionGranted ? '准备好了' : '第一次使用';
  const titleText = permissionGranted ? '进入Drama取景器' : '允许使用相机';
  const typedKicker = useTypewriter(kickerText, 110, 0);
  const typedTitle = useTypewriter(titleText, 115, 350, true, 2000, 55);
  const fadeAnim = useFadeIn(600, 200);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── 顶部官方品牌 Logo 栏 ── */}
      <View style={styles.brandRow}>
        <RainbowBrand />
        <IconButton
          icon="sparkles-outline"
          onPress={() => Alert.alert('今日提示', '慢一点，先找到光落下来的位置。')}
        />
      </View>

      {/* ── GIF 功能展示区 ── */}
      <Animated.View style={[styles.heroBannerFrame, { opacity: fadeAnim }]}>
        <Image
          source={require('../../../assets/drama-mobile-feature-banner.gif')}
          style={styles.heroBanner}
          resizeMode="cover"
          accessible
          accessibilityLabel="Drama相机功能展示"
        />
      </Animated.View>

      {/* ── Apple 雾态玻璃权限卡片 ── */}
      <View style={styles.permissionCardWrapper}>
        <View style={styles.permissionCard}>
          {/* 雾态玻璃模糊基底层 */}
          <BlurView
            intensity={45}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              styles.blurLayer,
            ]}
          />

          {/* 半透微光底色 */}
          <View style={[StyleSheet.absoluteFill, styles.cardGlassBg]} />

          {/* 顶端柔和反光高光 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={[StyleSheet.absoluteFill, styles.sheen]}
            pointerEvents="none"
          />

          {/* 04 MIST BLUE BUTTER 装饰弥散光晕 */}
          <View style={styles.glowOuter} pointerEvents="none">
            <LinearGradient
              colors={['#B8C9D6', '#7E9BB2', '#F3DFB5']}
              style={styles.glowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          {/* 精致边缘高光描边 */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassBorder]} />

          {/* 内容 */}
          <View style={styles.cardContent}>
            <View style={styles.permissionIconWrapper}>
              <BlurView
                intensity={40}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.iconGlowBg} />
              <MaterialCommunityIcons name="camera-iris" size={30} color={colors.primary} />
            </View>

            <Text style={styles.kicker}>{typedKicker}</Text>
            <Text style={styles.permissionTitle}>{renderHighlightedTitle(typedTitle)}</Text>

            {!permissionGranted && (
              <Text style={styles.permissionBody}>
                我们会用相机帮你看见光线、人物和更舒服的角度。
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <PrimaryButton
                label={permissionGranted ? '开始拍摄' : '开启相机'}
                onPress={onOpenCamera}
                variant="glass"
                icon={permissionGranted ? 'camera-outline' : 'sparkles-outline'}
              />
            </View>

            <Text style={styles.later}>稍后设置也可以</Text>
          </View>
        </View>
      </View>

      {/* ── 三大特性 (Apple 雾态玻璃小方块) ── */}
      <View style={styles.featureRow}>
        <FeatureCard
          icon="compass-outline"
          title="实时指导"
          body="机位 · 光线 · 焦段"
          accent="rgba(184, 201, 214, 0.32)"
        />
        <FeatureCard
          icon="color-palette-outline"
          title="一键风格"
          body="6 种清透预设"
          accent="rgba(243, 223, 181, 0.48)"
        />
        <FeatureCard
          icon="albums-outline"
          title="本地保存"
          body="每份灵感都留住"
          accent="rgba(102, 113, 123, 0.16)"
        />
      </View>

      {/* ── 今日灵感：完整呈现时尚大片（无多余AI文案、无箭头、主体完整展示） ── */}
      <View style={styles.editorialSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日灵感</Text>
        </View>

        {/* 时尚大片横滑画廊 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.editorialScroll}
          decelerationRate="fast"
          snapToInterval={286}
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
                {/* 3:4 比例大片完整呈现，无画面遮挡 */}
                <Image source={item.image} style={styles.editorialImage} />

                {/* 水晶边缘反光描边 */}
                <View pointerEvents="none" style={styles.cardBorderOverlay} />

                {/* 极简雾态小药丸标签 (无箭头、极简文字、不遮挡人物与衣服主体) */}
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <View style={styles.featureItemWrapper}>
      <View style={styles.featureItem}>
        <BlurView
          intensity={32}
          tint="light"
          style={[
            StyleSheet.absoluteFill,
            styles.blurLayer,
          ]}
        />
        <View style={[StyleSheet.absoluteFill, styles.featureGlassBg]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassBorderSmall]} />

        <View style={[styles.featureIconBg, { backgroundColor: accent }]}>
          <Ionicons name={icon} size={20} color={colors.ink} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

/* ── 打字机 Hook (支持无限循环打字/回退) ── */
function useTypewriter(
  text: string,
  speed: number,
  delay: number,
  loop: boolean = false,
  pauseDelay: number = 2000,
  deleteSpeed: number = 60
) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isDeleting = false;
    let currentIndex = 0;
    let isMounted = true;

    const tick = () => {
      if (!isMounted) return;

      if (!isDeleting) {
        // 正向打字
        if (currentIndex < text.length) {
          currentIndex += 1;
          setDisplayText(text.slice(0, currentIndex));
          timeoutId = setTimeout(tick, speed);
        } else {
          // 打字完成：若开启循环，停留片刻后开始回退删除
          if (loop) {
            isDeleting = true;
            timeoutId = setTimeout(tick, pauseDelay);
          }
        }
      } else {
        // 回退删除
        if (currentIndex > 0) {
          currentIndex -= 1;
          setDisplayText(text.slice(0, currentIndex));
          timeoutId = setTimeout(tick, deleteSpeed);
        } else {
          // 删除完毕，稍作停顿后重新打字，实现无休止循环
          isDeleting = false;
          timeoutId = setTimeout(tick, 450);
        }
      }
    };

    // 初始延迟启动
    timeoutId = setTimeout(tick, delay);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, speed, delay, loop, pauseDelay, deleteSpeed]);

  return displayText;
}

/* ── 渐入动画 Hook ── */
function useFadeIn(duration: number, delay: number) {
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [anim, delay, duration]);

  return anim;
}

/* ── 标题高亮 Drama 品牌色 ── */
function renderHighlightedTitle(text: string) {
  if (!text) return null;
  const dramaIndex = text.indexOf('Drama');
  if (dramaIndex !== -1) {
    const before = text.slice(0, dramaIndex);
    const after = text.slice(dramaIndex + 5);
    return (
      <Text>
        {before}
        <Text style={styles.dramaHighlight}>Drama</Text>
        {after}
      </Text>
    );
  }
  // 打字机正在输入 "D", "Dr", "Dra", "Dram" 过程中的平滑高亮
  const dIndex = text.indexOf('D');
  if (dIndex !== -1) {
    const before = text.slice(0, dIndex);
    const dramaPartial = text.slice(dIndex);
    return (
      <Text>
        {before}
        <Text style={styles.dramaHighlight}>{dramaPartial}</Text>
      </Text>
    );
  }
  return text;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 95,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBannerFrame: {
    width: '100%',
    aspectRatio: 1.925,
    marginTop: 26,
    marginBottom: 24,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#D7E2E8',
    borderWidth: 1,
    borderColor: 'rgba(75, 92, 104, 0.14)',
  },
  heroBanner: {
    width: '100%',
    height: '100%',
  },

  /* 权限卡片 */
  permissionCardWrapper: {
    borderRadius: 28,
    ...shadows.glassMd,
  },
  permissionCard: {
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 22,
  },
  blurLayer: {
    borderRadius: 28,
  },
  cardGlassBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
  },
  featureGlassBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },
  sheen: {
    maxHeight: 48,
  },
  glassBorder: {
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.88)',
  },
  glassBorderSmall: {
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  glowOuter: {
    position: 'absolute',
    top: -50,
    width: 220,
    height: 120,
    borderRadius: 110,
    overflow: 'hidden',
    opacity: 0.38,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  permissionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadows.glassSm,
  },
  iconGlowBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(110, 142, 167, 0.16)',
  },
  kicker: {
    color: colors.primary,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
    minHeight: 16,
  },
  permissionTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 24,
    marginTop: 6,
    textAlign: 'center',
    minHeight: 34,
    lineHeight: 32,
  },
  dramaHighlight: {
    color: colors.primary, // 04 MIST BLUE BUTTER 雾蓝主题色
    fontFamily: fonts.display,
    fontWeight: '700',
  },
  permissionBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 8,
    maxWidth: 280,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 18,
  },
  later: {
    color: colors.muted,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 14,
    opacity: 0.75,
  },

  /* 特性卡片 */
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  featureItemWrapper: {
    flex: 1,
    borderRadius: 20,
    ...shadows.glassSm,
  },
  featureItem: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    padding: 13,
    paddingTop: 15,
    minHeight: 122,
  },
  featureIconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  featureTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 11,
  },
  featureBody: {
    color: colors.muted,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },

  /* ── 时尚大片展区 (简洁原生设计) ── */
  editorialSection: {
    marginTop: 26,
    marginHorizontal: -20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  editorialScroll: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 14,
  },
  editorialCardWrapper: {
    width: 270,
    height: 360, // 完美的 3:4 比例，与原始照片 768x1024 严丝合缝，完整展现大片
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  tagBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.92)',
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
