import React, { useEffect } from "react";
import { View, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: "rect" | "circle";
  className?: string;
}

export const Skeleton = ({
  width,
  height,
  borderRadius = 8,
  style,
  variant = "rect",
  className,
}: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    width: width,
    height: height,
    borderRadius:
      variant === "circle" && typeof width === "number"
        ? width / 2
        : borderRadius,
    backgroundColor: "rgba(150, 150, 150, 0.2)", // Glass-like gray
  };

  return (
    <Animated.View
      style={[baseStyle, style, animatedStyle]}
      className={className}
    />
  );
};
