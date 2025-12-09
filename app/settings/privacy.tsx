import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <View className="flex-row items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    Privacy Policy
                </Text>
            </View>
            <ScrollView className="flex-1 p-4">
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    Last updated: December 2025
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    1. Information We Collect{'\n'}
                    We collect information you provide directly to us, such as when you create an account, list items, or communicate with other users.
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    2. How We Use Your Information{'\n'}
                    We use your information to provide, maintain, and improve our services, facilitate transactions, and send you related information.
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    3. Sharing of Information{'\n'}
                    We do not share your personal information with third parties except as described in this privacy policy (e.g., with payment processors).
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    4. Security{'\n'}
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
