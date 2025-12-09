import { useAuth } from "@/src/features/auth/store";
import { useNotificationStore } from "@/src/features/notifications/store";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Bell, Info, Package } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { FlatList, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const {
        notifications,
        isLoading,
        markNotificationAsRead,
        fetchNotifications, // Correct name
    } = useNotificationStore();

    useEffect(() => {
        if (user) {
            fetchNotifications(user.id);
        }
    }, [user]);

    const handlePress = async (notification: any) => {
        if (!notification.is_read) {
            await markNotificationAsRead(notification.id);
        }
        // Handle navigation based on type
        // if (notification.type === 'order_update') router.push(...)
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "order_update": return <Package size={24} color="#3b82f6" />;
            case "system": return <Info size={24} color="#64748b" />;
            default: return <Bell size={24} color="#3b82f6" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
                >
                    <ArrowLeft size={24} color={colorScheme === "dark" ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notifications
                </Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className={`flex-row p-4 border-b border-gray-50 dark:border-gray-900 ${!item.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                            }`}
                        onPress={() => handlePress(item)}
                    >
                        <View className="mr-4 mt-1">
                            {getIcon(item.type)}
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                {item.title}
                            </Text>
                            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.message}
                            </Text>
                            <Text className="mt-2 text-xs text-gray-400">
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <Bell size={48} color="#cbd5e1" />
                        <Text className="mt-4 text-gray-500">No notifications yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
