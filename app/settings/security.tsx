import { useSettingsStore } from "@/src/features/settings/store";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { ArrowLeft, Smartphone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecuritySettingsScreen() {
    const router = useRouter();
    const { isBiometricsEnabled, toggleBiometrics } = useSettingsStore(); // Assuming store exists
    const [isCompatible, setIsCompatible] = useState(false);
    const [biometryType, setBiometryType] = useState<string>("Biometrics");

    useEffect(() => {
        checkHardware();
    }, []);

    const checkHardware = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsCompatible(compatible);
        if (compatible) {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometryType("Face ID");
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                setBiometryType("Touch ID / Fingerprint");
            }
        }
    };

    const handleToggle = async (value: boolean) => {
        if (value) {
            // Test auth before enabling
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Confirm ${biometryType} to enable`,
            });
            if (result.success) {
                if (!isBiometricsEnabled) toggleBiometrics();
            } else {
                Alert.alert("Authentication Failed", "Could not enable using biometrics.");
                return; // Do not toggle switch
            }
        } else {
            if (isBiometricsEnabled) toggleBiometrics();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <View className="flex-row items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    Security
                </Text>
            </View>

            <View className="p-4">
                <View className="mb-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="mr-3 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Smartphone size={24} color="#3b82f6" />
                            </View>
                            <View>
                                <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                                    App Lock
                                </Text>
                                <Text className="text-sm text-slate-500 dark:text-slate-400">
                                    Require {biometryType} to open app
                                </Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "#3b82f6" }}
                            thumbColor={isBiometricsEnabled ? "#ffffff" : "#f4f3f4"}
                            onValueChange={handleToggle}
                            value={isBiometricsEnabled}
                            disabled={!isCompatible}
                        />
                    </View>
                    {!isCompatible && (
                        <Text className="mt-2 text-xs text-red-500">
                            Biometric hardware not available on this device.
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
