import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <View className="flex-row items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    Terms of Service
                </Text>
            </View>
            <ScrollView className="flex-1 p-4">
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    Last updated: December 2025
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    1. Acceptance of Terms{'\n'}
                    By accessing and using Radius, you accept and agree to be bound by the terms and provision of this agreement.
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    2. User Conduct{'\n'}
                    You agree to use the app only for lawful purposes. You are prohibited from posting any unlawful, harmful, threatening, or abusive material.
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    3. Buying and Selling{'\n'}
                    Radius acts as a marketplace. We are not a party to the transactions between buyers and sellers.
                </Text>
                <Text className="mb-4 text-base text-slate-700 dark:text-slate-300">
                    4. Limitation of Liability{'\n'}
                    Radius shall not be liable for any indirect, incidental, special, consequential or punitive damages.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
