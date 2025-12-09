import { useAuth } from "@/src/features/auth/store";
import { Link, Stack, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, FileText, Lock, Shield, ShieldCheck, UserX } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();

    const sections = [
        {
            title: "Account",
            items: [
                { icon: ShieldCheck, label: "Verify Identity", route: "/settings/verification" },
                { icon: Lock, label: "Security", route: "/settings/security" },
                { icon: UserX, label: "Blocked Users", route: "/settings/blocked" },
            ],
        },
        {
            title: "Support",
            items: [
                { icon: FileText, label: "Terms of Service", route: "/settings/terms" },
                { icon: Shield, label: "Privacy Policy", route: "/settings/privacy" },
            ],
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-row items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color={useColorScheme() === "dark" ? "white" : "black"} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">Settings</Text>
            </View>

            <ScrollView className="flex-1">
                {sections.map((section, index) => (
                    <View key={index} className="mt-6">
                        <Text className="mb-2 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {section.title}
                        </Text>
                        <View className="bg-white dark:bg-slate-900">
                            {section.items.map((item, itemIndex) => (
                                <Link href={item.route as any} key={itemIndex} asChild>
                                    <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-50 dark:border-gray-800">
                                        <View className="flex-row items-center">
                                            <item.icon size={20} color="#64748b" />
                                            <Text className="ml-3 text-base font-medium text-slate-900 dark:text-white">
                                                {item.label}
                                            </Text>
                                        </View>
                                        <ArrowRight size={16} color="#cbd5e1" />
                                    </TouchableOpacity>
                                </Link>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    onPress={signOut}
                    className="mt-8 mx-4 rounded-xl bg-red-50 p-4 items-center justify-center dark:bg-red-900/20"
                >
                    <Text className="font-semibold text-red-600 dark:text-red-400">Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
