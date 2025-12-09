import { useSettingsStore } from "@/src/features/settings/store";
import * as LocalAuthentication from "expo-local-authentication";
import { Lock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    AppState,
    Text,
    TouchableOpacity,
    View
} from "react-native";

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
                // Determine if we should lock. For strict security, lock every time.
                // Or use a timestamp to allow short switching?
                // For this demo: Lock immediately on return.
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
            } else {
                // Stay locked
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
        <View className="absolute inset-0 z-[9999] bg-white dark:bg-gray-900 items-center justify-center">
            <View className="items-center">
                <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-6">
                    <Lock size={40} color="#3b82f6" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Radius is Locked
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 mb-8">
                    Authentication is required to access the app.
                </Text>

                <TouchableOpacity
                    onPress={authenticate}
                    className="bg-blue-600 px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold text-lg">
                        Unlock
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
