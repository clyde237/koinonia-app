import React from 'react';
import { Image, StyleSheet } from 'react-native';

type Props = {
  opacity?: number;
};

export function FiligraneWatermark({ opacity = 0.2 }: Props) {
  return (
    <Image
      source={require('../assets/filigrane.png')}
      style={[
        StyleSheet.absoluteFill,
        s.watermark,
        { opacity },
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
