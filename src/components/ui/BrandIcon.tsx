import React from 'react';
import { Image } from 'react-native';

/** Shared pony branding, rasterized from assets/pony-icon.svg for native apps. */
export function BrandIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={require('../../../assets/logo_icon.png')}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      resizeMode="contain"
      accessibilityLabel="Drama相机小马图标"
    />
  );
}
