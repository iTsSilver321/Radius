import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/features/auth/store";
import { useUserProfile } from "@/src/features/profile/hooks/useUserProfile";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowRight, FileText, Heart, Lock, LogOut, Moon, Settings, Shield, ShieldCheck, Star, Sun, UserX } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { profile, loading, refetch } = useUserProfile(user?.id);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleSignOut = async () => {
        await signOut();
        router.replace("/auth/login");
    };

    if (!user) return null;

    if (loading && !profile) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background">
            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="bg-white pb-6 pt-4 dark:bg-card border-b border-gray-100 dark:border-white/5">
                    <SafeAreaView edges={["top"]}>
                        <View className="px-6">
                            <View className="mb-6 flex-row items-center justify-between">
                                <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Profile
                                </Text>
                                <TouchableOpacity onPress={() => router.push("/settings")}>
                                    <Settings size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center">
                                <Image
                                    source={{ uri: profile?.avatar_url || "https://github.com/shadcn.png" }}
                                    className="h-20 w-20 rounded-full bg-slate-100"
                                />
                                <View className="ml-4 flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                            {profile?.full_name || "Radius User"}
                                        </Text>
                                        {profile?.is_verified && (
                                            <ShieldCheck size={16} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: 6 }} />
                                        )}
                                    </View>
                                    <Text className="text-slate-500 dark:text-slate-400">
                                        @{profile?.username || user.email?.split("@")[0]}
                                    </Text>
                                    <View className="mt-2 flex-row items-center">
                                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                        <Text className="ml-1 font-bold text-slate-700 dark:text-slate-200">
                                            {profile?.rating?.toFixed(1) || "5.0"}
                                        </Text>
                                        <Text className="ml-1 text-slate-500">
                                            ({profile?.reviews_count || 0} reviews)
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <View className="px-4 py-6">
                    <View className="mb-6 flex-row justify-between">
                        <Card className="flex-1 mr-2 items-center p-4">
                            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                                {profile?.items_sold || 0}
                            </Text>
                            <Text className="text-sm text-slate-500">Sold</Text>
                        </Card>
                        <Card className="flex-1 mx-2 items-center p-4">
                            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                                {profile?.items_listed || 0}
                            </Text>
                            <Text className="text-sm text-slate-500">Listed</Text>
                        </Card>
                        <Card className="flex-1 ml-2 items-center p-4">
                            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                                ${profile?.total_earnings || 0}
                            </Text>
                            <Text className="text-sm text-slate-500">Earned</Text>
                        </Card>
                    </View>

                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                        Account
                    </Text>
                    <Card className="mb-6 overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={() => router.push({ pathname: "/user/[id]", params: { id: user.id } })}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                                    <FileText size={18} color="#3b82f6" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    My Listings
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-white/10"
                            onPress={() => router.push("/settings/verification")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                                    <ShieldCheck size={18} color="#16a34a" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Verify Identity
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-white/10"
                            onPress={() => router.push("/favorites")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 items-center justify-center mr-3">
                                    <Heart size={18} color="#ec4899" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Saved Items
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-white/10"
                            onPress={toggleColorScheme}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mr-3">
                                    <View className="dark:hidden">
                                        <Moon size={18} color="#6366f1" />
                                    </View>
                                    <View className="hidden dark:flex">
                                        <Sun size={18} color="#6366f1" />
                                    </View>
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Display Mode
                                </Text>
                            </View>
                            <Text className="text-gray-500 text-sm mr-2 capitalize dark:text-gray-400">
                                Toggle
                            </Text>
                        </TouchableOpacity>
                    </Card>

                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 mb-2 uppercase tracking-wider">
                        Settings & Privacy
                    </Text>
                    <Card className="mb-6 overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={() => router.push("/settings/blocked")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
                                    <UserX size={18} color="#ef4444" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Blocked Users
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-white/10"
                            onPress={() => router.push("/settings/security")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
                                    <Lock size={18} color="#6b7280" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Security
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </Card>

                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 mb-2 uppercase tracking-wider">
                        About
                    </Text>
                    <Card className="mb-6 overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={() => router.push("/settings/terms")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
                                    <FileText size={18} color="#6b7280" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Terms of Service
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-white/10"
                            onPress={() => router.push("/settings/privacy")}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
                                    <Shield size={18} color="#6b7280" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Privacy Policy
                                </Text>
                            </View>
                            <ArrowRight size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </Card>

                    <TouchableOpacity
                        className="mb-8 flex-row items-center justify-center rounded-xl bg-red-50 p-4 dark:bg-red-900/10"
                        onPress={handleSignOut}
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text className="ml-2 font-bold text-red-500">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
