import { useSettingsStore } from "@/src/features/settings/store";
import * as LocalAuthentication from "expo-local-authentication";
import { Lock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { GlassView } from "@/components/ui/GlassView";
import { Button } from "@/components/ui/Button";

export const BiometricProtection = () => {
  const { isBiometricsEnabled } = useSettingsStore();
  const [isLocked, setIsLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (!isBiometricsEnabled) return;

    // Check validation on mount if enabled (e.g. cold start)
    setIsLocked(true);
    authenticate();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && isBiometricsEnabled) {
        setIsLocked(true);
        authenticate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricsEnabled]);

  const authenticate = async () => {
    if (authenticating) return;
    setAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Radius",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAuthenticating(false);
    }
  };

  if (!isLocked || !isBiometricsEnabled) {
    return null;
  }

  return (
    <GlassView
      intensity={95}
      tint="dark"
      className="absolute inset-0 z-[9999] items-center justify-center"
    >
      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        className="items-center"
      >
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="w-24 h-24 bg-white/10 rounded-full items-center justify-center mb-8 border border-white/20 shadow-xl"
        >
          <Lock size={48} color="#ffffff" />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(400).springify()}
          className="text-3xl font-extrabold text-white mb-2 tracking-tight"
        >
          Security Lock
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(500).springify()}
          className="text-gray-400 mb-10 text-center font-medium"
        >
          Authentication is required to access the app.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Button
            variant="primary"
            size="lg"
            onPress={authenticate}
            className="min-w-[200px]"
          >
            Unlock
          </Button>
        </Animated.View>
      </Animated.View>
    </GlassView>
  );
};
