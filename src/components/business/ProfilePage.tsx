import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadows } from '../../constants/theme';
import { PageHeader } from '../ui/PageHeader';
import { CardSurface } from '../ui/CardSurface';
import { useRouter } from 'expo-router';

const profileItems = [
  { title: 'AI 配置', icon: 'options-outline' },
  { title: '我的作品', icon: 'images-outline' },
  { title: '收藏的灵感', icon: 'heart-outline' },
  { title: '拍摄统计', icon: 'bar-chart-outline' },
  { title: '意见反馈', icon: 'mail-outline' },
  { title: '关于Drama相机', icon: 'information-circle-outline' },
] as const;

export function ProfilePage() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <PageHeader title="我的" icon="settings-outline" />

      {/* ── 个人信息卡片 (与首页卡片保持一致的 CardSurface) ── */}
      <CardSurface
        radius={26}
        borderWidth={1.2}
        borderColor="rgba(255, 255, 255, 0.58)"
        style={styles.profileCardWrapper}
        contentStyle={styles.profileCard}
      >
        <View style={styles.profileContent}>
          {/* 头像 */}
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#3B8E7B', '#2D7565']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>D</Text>
            </LinearGradient>
            <View pointerEvents="none" style={styles.avatarBorder} />
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>摄影练习生</Text>
            <Text style={styles.desc}>用镜头记录生活的呼吸感</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
        </View>
      </CardSurface>

      {/* ── 功能方块 (与首页 FeatureCard 保持完全一致) ── */}
      <View style={styles.tiles}>
        <Tile
          icon="color-palette-outline"
          title="我的风格"
          value="4种清新预设"
          accent="rgba(45, 117, 101, 0.12)"
          iconColor={colors.primary}
        />
        <Tile
          icon="camera-outline"
          title="相机设置"
          value="AI构图辅助"
          accent="rgba(143, 174, 197, 0.20)"
          iconColor="#467694"
        />
        <Tile
          icon="book-outline"
          title="使用指南"
          value="光线与焦段"
          accent="rgba(245, 222, 179, 0.35)"
          iconColor="#8A6E35"
        />
      </View>

      {/* ── 列表组 ── */}
      <CardSurface
        radius={24}
        borderWidth={1.2}
        borderColor="rgba(255, 255, 255, 0.58)"
        style={styles.listCardWrapper}
        contentStyle={styles.listCard}
      >
        <View style={styles.listContent}>
          {profileItems.map(
            (item, index) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.listRow,
                  index === profileItems.length - 1 && styles.listRowLast,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  if (item.title === 'AI 配置') {
                    router.push('/settings/ai');
                  } else if (item.title === '我的作品' || item.title === '收藏的灵感') {
                    router.navigate('/album');
                  } else {
                    Alert.alert(item.title, '这个入口会在下一版开放。');
                  }
                }}
              >
                <View style={styles.listLeft}>
                  <View style={styles.listIconWrap}>
                    <Ionicons
                      name={item.icon}
                      size={17}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.listText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={colors.subtle} />
              </Pressable>
            )
          )}
        </View>
      </CardSurface>

      <Text style={styles.quote}>“生活很普通，但值得好好拍。”</Text>
    </ScrollView>
  );
}

function Tile({
  icon,
  title,
  value,
  accent,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  accent: string;
  iconColor?: string;
}) {
  return (
    <CardSurface
      radius={20}
      borderWidth={1.1}
      borderColor="rgba(255, 255, 255, 0.56)"
      style={styles.tileWrapper}
      contentStyle={styles.tile}
    >
      <View style={[styles.tileIconBg, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={20} color={iconColor ?? colors.ink} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },

  /* 个人卡片 */
  profileCardWrapper: {
    marginTop: 24,
    borderRadius: 26,
    backgroundColor: 'transparent',
    ...shadows.glassMd,
  },
  profileCard: {
    padding: 18,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    position: 'relative',
    ...shadows.glassSm,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  avatarText: {
    color: colors.whiteWarm,
    fontFamily: fonts.display,
    fontSize: 26,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    color: colors.muted,
    fontSize: 11.5,
    marginTop: 4,
  },

  /* 功能方块 */
  tiles: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  tileWrapper: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'transparent',
    ...shadows.glassSm,
  },
  tile: {
    flexGrow: 1,
    padding: 13,
    paddingTop: 15,
    minHeight: 122,
  },
  tileIconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  tileTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 11,
  },
  tileValue: {
    color: colors.muted,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },

  /* 列表 */
  listCardWrapper: {
    borderRadius: 24,
    marginTop: 18,
    backgroundColor: 'transparent',
    ...shadows.glassSm,
  },
  listCard: {
    paddingHorizontal: 16,
  },
  listContent: {
    width: '100%',
  },
  listRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(21, 29, 36, 0.05)',
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(45, 117, 101, 0.08)',
  },
  listText: {
    color: colors.ink,
    fontSize: 13.5,
    fontWeight: '500',
  },
  quote: {
    textAlign: 'center',
    color: colors.muted,
    fontFamily: fonts.display,
    fontSize: 14.5,
    marginTop: 28,
    fontStyle: 'italic',
  },
});
