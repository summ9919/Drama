import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../constants/theme';
import { IconButton } from './IconButton';

type Props = { title: string; icon?: keyof typeof Ionicons.glyphMap; onPress?: () => void };

export function PageHeader({ title, icon = 'sparkles-outline', onPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onPress ? <IconButton icon={icon} onPress={onPress} /> : <Pressable style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    minHeight: 48,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  spacer: { width: 42, height: 42 },
});
