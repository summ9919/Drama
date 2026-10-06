import React from 'react';
import {
  Alert,
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
import { PageHeader } from '../ui/PageHeader';

export function ProfilePage() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <PageHeader title="我的" icon="settings-outline" />

      {/* ── Apple 雾态个人信息卡片 ── */}
      <View style={styles.profileCardWrapper}>
        <View style={styles.profileCard}>
          <BlurView
            intensity={65}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              styles.cardBlur,
            ]}
          />
          <View style={[StyleSheet.absoluteFill, styles.cardBg]} />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={[StyleSheet.absoluteFill, styles.sheen]}
            pointerEvents="none"
          />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.cardBorder]} />

          <View style={styles.profileContent}>
            {/* 头像 */}
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={[colors.primary, colors.mistBlue]}
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
              <Text style={styles.desc}>用镜头记录生活的温暖</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </View>
      </View>

      {/* ── Apple 雾态功能方块 (04 MIST BLUE BUTTER 配色) ── */}
      <View style={styles.tiles}>
        <Tile
          icon="color-palette-outline"
          title="我的风格"
          value="4种风格"
          accent="rgba(184, 201, 214, 0.32)"
        />
        <Tile
          icon="camera-outline"
          title="相机设置"
          value="专业参数"
          accent="rgba(243, 223, 181, 0.48)"
        />
        <Tile
          icon="book-outline"
          title="使用指南"
          value="入门到进阶"
          accent="rgba(102, 113, 123, 0.16)"
        />
      </View>

      {/* ── Apple 雾态列表组 ── */}
      <View style={styles.listCardWrapper}>
        <View style={styles.listCard}>
          <BlurView
            intensity={60}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              styles.cardBlur,
            ]}
          />
          <View style={[StyleSheet.absoluteFill, styles.cardBg]} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.cardBorder]} />

          <View style={styles.listContent}>
            {['我的作品', '收藏的灵感', '拍摄统计', '意见反馈', '关于Drama相机'].map(
              (item, index) => (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    styles.listRow,
                    index === 4 && styles.listRowLast,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => Alert.alert(item, '这个入口会在下一版开放。')}
                >
                  <View style={styles.listLeft}>
                    <View style={styles.listIconWrap}>
                      <BlurView
                        intensity={40}
                        tint="light"
                        style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                      />
                      <View style={styles.iconInnerBg} />
                      <Ionicons
                        name={
                          (
                            [
                              'images-outline',
                              'heart-outline',
                              'bar-chart-outline',
                              'mail-outline',
                              'information-circle-outline',
                            ] as const
                          )[index]
                        }
                        size={17}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color={colors.muted} />
                </Pressable>
              )
            )}
          </View>
        </View>
      </View>

      <Text style={styles.quote}>“生活很普通，但值得好好拍。”</Text>
    </ScrollView>
  );
}

function Tile({
  icon,
  title,
  value,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.tileWrapper}>
      <View style={styles.tile}>
        <BlurView
          intensity={50}
          tint="light"
          style={[
            StyleSheet.absoluteFill,
            styles.cardBlur,
          ]}
        />
        <View style={[StyleSheet.absoluteFill, styles.cardBg]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.tileBorder]} />

        <View style={[styles.tileIconBg, { backgroundColor: accent }]}>
          <Ionicons name={icon} size={21} color={colors.primary} />
        </View>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileValue}>{value}</Text>
      </View>
    </View>
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
    ...shadows.glassMd,
  },
  profileCard: {
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    padding: 18,
  },
  cardBlur: {
    borderRadius: 26,
  },
  cardBg: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  sheen: {
    borderRadius: 26,
    maxHeight: 34,
  },
  cardBorder: {
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
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
    ...shadows.glassSm,
  },
  tile: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    padding: 13,
    minHeight: 114,
  },
  tileBorder: {
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
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
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  tileValue: {
    color: colors.muted,
    fontSize: 10.5,
    marginTop: 4,
  },

  /* 列表 */
  listCardWrapper: {
    borderRadius: 24,
    marginTop: 18,
    ...shadows.glassSm,
  },
  listCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 16,
  },
  listContent: {
    zIndex: 2,
  },
  listRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(220, 229, 236, 0.55)',
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
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconInnerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(126, 155, 178, 0.12)',
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
