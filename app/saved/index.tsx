import { EmptyState } from "@/src/components/ui/EmptyState";
import { useAuth } from "@/src/features/auth/store";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { Item } from "@/src/features/feed/types";
import { fetchSavedItems } from "@/src/features/saved/api";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, Heart } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedItemsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadItems = async () => {
        if (!user) return;
        try {
            const data = await fetchSavedItems(user.id);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadItems();
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-white/5">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-white/10"
                    >
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                        Saved Items
                    </Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#ef4444" />
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        renderItem={({ item }) => (
                            <View className="flex-1 mx-2">
                                <FeedItem
                                    item={item}
                                    onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}
                                />
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        contentContainerStyle={{ padding: 16 }}
                        columnWrapperStyle={items.length > 0 ? { justifyContent: 'space-between' } : undefined}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                        }
                        ListEmptyComponent={
                            <EmptyState
                                icon={Heart}
                                title="No saved items yet"
                                description="Items you like will appear here for easy access."
                                actionLabel="Explore Feed"
                                onAction={() => router.push("/(tabs)")}
                            />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
