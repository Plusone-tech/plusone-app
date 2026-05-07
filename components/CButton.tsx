import { Pressable, StyleSheet } from "react-native";
import React from "react";
import CText from "./CText";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  ReduceMotion,
  Easing as ReanimatedEasing,
} from "react-native-reanimated";

interface CButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CButton({
  onPress,
  children,
  style,
  disabled = false,
}: CButtonProps) {

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressInFunc = () => {
    scale.value = withTiming(0.95, {
      duration: 150,
      easing: ReanimatedEasing.out(ReanimatedEasing.poly(2)),
      reduceMotion: ReduceMotion.System,
    });
  }

  const onPressOutFunc = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: ReanimatedEasing.in(ReanimatedEasing.poly(2)),
      reduceMotion: ReduceMotion.System,
    });
  }


  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={onPressInFunc}
      onPressOut={onPressOutFunc}
      style={[styles.button, style, animatedStyle]}
    >
      <CText style={style} fontSize={20}>
        {children}
      </CText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: "#D3A7FF",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: "black",
    overflow: "hidden",
  },
});
