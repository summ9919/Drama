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
    height: 56,
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  logoImage: {
    width: 165,
    aspectRatio: 2171 / 724,
    alignSelf: 'flex-start',
  },
});
