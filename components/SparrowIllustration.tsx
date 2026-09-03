import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Ellipse, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface SparrowIllustrationProps {
  size?: number;
  animated?: boolean;
}

// Aspect ratio matches the 182x140 viewBox the artwork was drawn in.
const ASPECT_RATIO = 140 / 182;

export function SparrowIllustration({ size = 120, animated = false }: SparrowIllustrationProps) {
  const wingFlap = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      wingFlap.stopAnimation();
      wingFlap.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wingFlap, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(wingFlap, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, wingFlap]);

  const rotation = wingFlap.interpolate({ inputRange: [0, 1], outputRange: [-6, -32] });

  return (
    <Svg viewBox="0 0 182 140" width={size} height={size * ASPECT_RATIO}>
      <Path d="M6,80 Q0,72 5,62 Q22,70 38,78 Q24,88 6,80 Z" fill="#8A5A2B" />
      <Ellipse cx={88} cy={80} rx={44} ry={34} fill="#B9793F" />
      <Ellipse cx={94} cy={96} rx={30} ry={20} fill="#FFE9BE" />
      <AnimatedG rotation={rotation} origin="78,68">
        <Path d="M56,58 Q94,34 120,58 Q100,74 76,82 Q60,74 56,58 Z" fill="#8A5A2B" />
        <Path d="M66,60 Q90,50 106,60 Q90,66 74,70 Z" fill="#FFB703" />
      </AnimatedG>
      <Circle cx={134} cy={56} r={24} fill="#B9793F" />
      <Ellipse cx={138} cy={64} rx={16} ry={12} fill="#FFE9BE" />
      <Ellipse cx={124} cy={80} rx={10} ry={15} fill="#152436" />
      <Path d="M154,52 L172,56 L154,62 Z" fill="#152436" />
      <Circle cx={142} cy={50} r={3.2} fill="#152436" />
      <Circle cx={143.2} cy={48.8} r={1} fill="#FFFFFF" />
    </Svg>
  );
}
