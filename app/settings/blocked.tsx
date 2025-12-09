import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/features/auth/store";
import { fetchBlockedProfiles, unblockUser } from "@/src/features/moderation/api";
import { Profile } from "@/src/features/profile/api";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, UserX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BlockedUsersScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [blockedUsers, setBlockedUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!user) return;
        try {
            const data = await fetchBlockedProfiles(user.id);
            setBlockedUsers(data as any); // Type assertion needed due to join
        } catch (error) {
            console.error("Failed to load blocked users:", error);
            Alert.alert("Error", "Failed to load blocked users.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const handleUnblock = async (blockedId: string) => {
        if (!user) return;
        try {
            await unblockUser(user.id, blockedId);
            // Optimistically update list
            setBlockedUsers(prev => prev.filter(p => p.id !== blockedId));
            Alert.alert("Success", "User unblocked.");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to unblock user.");
        }
    };

    const renderItem = ({ item }: { item: Profile }) => (
        <View className="flex-row items-center justify-between p-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/10">
            <View className="flex-row items-center flex-1">
                <Image
                    source={{
                        uri: item.avatar_url || `https://ui-avatars.com/api/?name=${item.full_name || "User"}&background=random`,
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                    contentFit="cover"
                    className="mr-3 bg-gray-200 dark:bg-gray-700"
                />
                <View>
                    <Text className="font-bold text-gray-900 dark:text-white">
                        {item.full_name || "Unknown User"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {item.username ? `@${item.username}` : "Radius User"}
                    </Text>
                </View>
            </View>
            <Button
                title="Unblock"
                variant="outline"
                size="sm"
                onPress={() => handleUnblock(item.id)}
                className="border-gray-200 dark:border-gray-700"
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center p-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-white/10"
                >
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                    Blocked Users
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b5998" />
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b5998" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 px-6">
                            <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                                <UserX size={32} color="#9ca3af" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                No blocked users
                            </Text>
                            <Text className="text-center text-gray-500 dark:text-gray-400">
                                Users you block will appear here. You won't see their listings or messages.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
