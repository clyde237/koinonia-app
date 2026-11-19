import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type FlameEmblemProps = {
  active: boolean;
};

export function FlameEmblem({ active }: FlameEmblemProps) {
  const breeze = useSharedValue(0);

  useEffect(() => {
    if (active) {
      breeze.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 850, easing: Easing.inOut(Easing.sin) }),
          withTiming(-0.65, { duration: 950, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 750, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 650, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(breeze);
      breeze.value = 0;
    }
    return () => cancelAnimation(breeze);
  }, [active, breeze]);

  const flameProps = useAnimatedProps(() => {
    const tip = breeze.value * 32;
    const bend = breeze.value * 17;
    return {
      d: `M ${598 + tip} 0
        C ${501 + tip} 52 ${422 + bend} 175 ${434 + bend} 292
        C ${439 + bend} 370 ${477 + bend} 461 470 521
        C 464 572 430 592 388 590
        C 320 587 265 526 281 394
        C 229 481 205 576 210 669
        C 218 869 348 986 556 984
        C 737 983 877 866 879 686
        C 883 523 821 406 ${690 + bend} 291
        C ${590 + tip} 203 ${531 + tip} 105 ${598 + tip} 0 Z`,
    };
  });

  return (
    <View accessible accessibilityLabel="Emblème Koinonia" style={{ width: 150, height: 157 }}>
      <Svg width="100%" height="100%" viewBox="0 0 1116 1166">
        <Path
          fill="#2A364E"
          d="M 505 52 C 219 78 0 314 0 604 C 0 914 250 1166 558 1166 C 866 1166 1116 914 1116 604 C 1116 313 891 75 599 52 L 603 108 C 859 132 1032 343 1032 604 C 1032 865 820 1075 558 1075 C 296 1075 84 865 84 604 C 84 343 267 133 471 109 Z"
        />
        <AnimatedPath animatedProps={flameProps} fill="#00A99D" />
        <Path
          fill="#DBECE9"
          d="M 596 475 C 558 499 546 546 527 600 C 502 673 470 735 410 739 C 384 741 362 729 353 708 C 331 770 340 847 379 900 C 419 956 484 977 554 977 C 653 977 746 912 747 807 C 750 701 678 655 623 604 C 584 568 576 528 596 475 Z"
        />
        <Path
          fill="#F5F5F3"
          d="M 568 657 C 576 710 563 747 536 780 C 508 815 473 835 464 883 C 455 934 494 970 555 970 C 618 970 657 930 657 873 C 656 829 640 784 624 748 C 618 783 598 789 588 778 C 568 756 597 708 568 657 Z"
        />
      </Svg>
    </View>
  );
}
