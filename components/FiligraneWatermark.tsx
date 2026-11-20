import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from '../lib/ThemeContext';

type Props = {
  opacity?: number;
};

export function FiligraneWatermark({ opacity }: Props) {
  const { isDark } = useTheme();
  const effectiveOpacity = opacity ?? (isDark ? 0.12 : 0.15);

  return (
    <Image
      source={require('../assets/filigrane_green.png')}
      style={[
        StyleSheet.absoluteFill,
        s.watermark,
        { opacity: effectiveOpacity },
      ]}
      resizeMode="cover"
      pointerEvents="none"
    />
  );
}

const s = StyleSheet.create({
  watermark: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
});
