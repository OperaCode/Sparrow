import { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface SparrowLogoProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

export function SparrowLogo({ size = 32, color = colors.text, animated = false }: SparrowLogoProps) {
  const wingLift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      wingLift.stopAnimation();
      wingLift.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wingLift, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wingLift, { toValue: 0, duration: 520, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, wingLift]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.body, { width: size * 0.55, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: color }]} />
      <Animated.View style={[styles.wing, {
        width: size * 0.45,
        height: size * 0.18,
        borderTopLeftRadius: size * 0.12,
        borderTopRightRadius: size * 0.04,
        borderBottomLeftRadius: size * 0.04,
        borderBottomRightRadius: size * 0.04,
        backgroundColor: color,
        top: size * 0.12,
        left: -size * 0.08,
      }, animated && { transform: [{ rotate: '-15deg' }, { translateY: wingLift.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.12] }) }] }]} />
      <View style={[styles.beak, {
        width: size * 0.18,
        height: size * 0.1,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.05,
        borderBottomLeftRadius: size * 0.05,
        top: size * 0.12,
        right: -size * 0.12,
      }]} />
      <View style={[styles.tail, {
        width: size * 0.2,
        height: size * 0.12,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.06,
        borderBottomLeftRadius: size * 0.06,
        top: size * 0.18,
        left: -size * 0.18,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  body: {},
  wing: {
    position: 'absolute',
    transform: [{ rotate: '-15deg' }],
  },
  beak: {
    position: 'absolute',
  },
  tail: {
    position: 'absolute',
    transform: [{ rotate: '10deg' }],
  },
});
