import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { BrandIcon } from './BrandIcon';

export function RainbowBrand() {
  return (
    <View style={styles.container}>
      <BrandIcon size={40} />
      <Text style={styles.wordmark}>Drama相机</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordmark: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
});
