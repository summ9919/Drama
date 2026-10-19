import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export function RainbowBrand() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        accessibilityLabel="Drama相机"
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 144,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  logoImage: {
    width: 144,
    height: 48,
    maxWidth: 144,
    maxHeight: 48,
  },
});
