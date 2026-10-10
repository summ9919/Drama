import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  radius: number;
  borderWidth: number;
  borderColor: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function CardSurface({
  children,
  radius,
  borderWidth,
  borderColor,
  style,
  contentStyle,
}: Props) {
  return (
    <View style={[style, styles.surface, { borderRadius: radius }]}>
      <View
        testID="card-surface-background"
        collapsable={false}
        style={[
          contentStyle,
          styles.surface,
          styles.frame,
          { borderRadius: radius, borderWidth, borderColor },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  surface: {
    // Opaque on both platforms: no alpha blending with page shapes or shadows.
    // The padding and content share this same native background drawable.
    backgroundColor: '#F2F1EB',
  },
});
