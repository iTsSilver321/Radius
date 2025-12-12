import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { CheckCircle, Info, XCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "@/components/ui/GlassView";
import { useUIStore } from "@/src/features/ui/store";
import { useHaptics } from "@/src/hooks/useHaptics";

export const Toast = () => {
  const { visible, message, type, hideToast } = useUIStore();
  const insets = useSafeAreaInsets();
  const { success, error, warning } = useHaptics();

  useEffect(() => {
    if (visible) {
      // Trigger haptic based on type
      if (type === "success") success();
      else if (type === "error") error();
      else warning();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, hideToast, type, success, error, warning]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} color="#4ade80" />; // green-400
      case "error":
        return <XCircle size={24} color="#f87171" />; // red-400
      default:
        return <Info size={24} color="#60a5fa" />; // blue-400
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500/30";
      case "error":
        return "border-red-500/30";
      default:
        return "border-blue-500/30";
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      className="absolute left-4 right-4 z-50"
      style={{ top: insets.top + 10 }}
    >
      <GlassView
        intensity={40}
        tint="dark"
        className={`flex-row items-center p-4 rounded-2xl border ${getBorderColor()} shadow-lg`}
      >
        <View className="mr-3">{getIcon()}</View>
        <Text className="flex-1 text-white font-medium text-base tracking-tight">
          {message}
        </Text>
      </GlassView>
    </Animated.View>
  );
};
