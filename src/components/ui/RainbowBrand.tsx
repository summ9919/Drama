import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export function RainbowBrand() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 42,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  logoImage: {
    height: 40,
    width: 136,
  },
});
