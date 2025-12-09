import { useAuth } from "@/src/features/auth/store";
import { ChatRoom, fetchRooms } from "@/src/features/chat/api";
import { formatDistanceToNow } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InboxScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadRooms();
            }
        }, [user])
    );

    const loadRooms = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await fetchRooms(user.id);
            setRooms(data);
        } catch (error) {
            console.error("Failed to fetch inbox:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ChatRoom }) => {
        const isUnread = item.last_message && !item.last_message.is_read && item.last_message.sender_id !== user?.id;

        return (
            <TouchableOpacity
                className={`flex-row items-center p-4 border-b border-gray-100 dark:border-white/5 ${isUnread ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-white dark:bg-background"}`}
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
            >
                <Image
                    source={{ uri: item.other_user?.avatar_url || "https://ui-avatars.com/api/?background=random" }}
                    className="h-14 w-14 rounded-full bg-gray-200"
                />
                <View className="ml-3 flex-1">
                    <View className="flex-row justify-between mb-1">
                        <Text className={`font-bold text-base text-gray-900 dark:text-white ${isUnread ? "text-blue-600 dark:text-blue-400" : ""}`}>
                            {item.other_user?.full_name || "Radius User"}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {item.last_message?.created_at
                                ? formatDistanceToNow(new Date(item.last_message.created_at), { addSuffix: true })
                                : (item.updated_at ? formatDistanceToNow(new Date(item.updated_at), { addSuffix: true }) : "New")}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        {/* Item Context */}
                        <Text className="text-xs text-gray-400 mr-2 font-medium bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                            {item.item?.title || "Item"}
                        </Text>
                        <Text
                            className={`flex-1 text-sm ${isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                            numberOfLines={1}
                        >
                            {item.last_message?.content || "Start the conversation..."}
                        </Text>
                    </View>
                </View>
                {isUnread && (
                    <View className="ml-2 h-3 w-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
                )}
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-background">
                <View className="bg-white dark:bg-white/5 p-6 rounded-full mb-6">
                    <MessageSquare size={48} color="#9ca3af" />
                </View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Sign in to chat
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center px-10">
                    Connect with sellers and buyers securely on Radius.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background">
            <SafeAreaView className="flex-1" edges={["top"]}>
                <View className="px-4 py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-background">
                    <Text className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Messages
                    </Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : (
                    <FlatList
                        data={rooms}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center mt-20 px-8">
                                <View className="bg-gray-100 dark:bg-white/5 p-6 rounded-full mb-4">
                                    <MessageSquare size={32} className="text-gray-400" />
                                </View>
                                <Text className="text-gray-900 dark:text-white font-bold text-lg mb-1">No messages yet</Text>
                                <Text className="text-gray-500 text-center leading-relaxed">
                                    When you contact a seller or someone contacts you, the conversation will appear here.
                                </Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
