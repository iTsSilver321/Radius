import { GlassCard } from "@/src/components/ui/GlassCard";
import { useAuth } from "@/src/features/auth/store";
import { FeedFilters, fetchItems } from "@/src/features/feed/api";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { FilterModal } from "@/src/features/feed/components/FilterModal";
import { Item } from "@/src/features/feed/types";
import { useLocation } from "@/src/features/location/hooks/useLocation";
import { useNotificationStore } from "@/src/features/notifications/store";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell, MapPin, Search, SlidersHorizontal } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";



export default function FeedScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    useLocation();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    const [filters, setFilters] = useState<FeedFilters>({});
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);



    const loadItems = async () => {
        try {
            const data = await fetchItems({
                ...filters,
                searchQuery: debouncedSearchQuery,
            });
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        loadItems();
    }, [debouncedSearchQuery, filters]);



    useFocusEffect(
        useCallback(() => {
            loadItems();
            if (user) fetchNotifications(user.id);
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadItems();
        if (user) await fetchNotifications(user.id);
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-white dark:bg-black">
            {/* Header Background Gradient (Optional) */}

            {/* Main Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center pt-32">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <FlashList
                    data={items}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    renderItem={({ item }: { item: Item }) => (
                        <View className="p-1">
                            <FeedItem
                                item={item}
                                onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}
                            />
                        </View>
                    )}
                    // @ts-ignore
                    estimatedItemSize={280}
                    contentContainerStyle={{
                        paddingHorizontal: 8,
                        paddingTop: 170, // Increased to avoid overlap
                        paddingBottom: 100
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-500">No items found.</Text>
                        </View>
                    }
                />
            )}

            {/* Glass Header */}
            <View className="absolute top-0 left-0 right-0 overflow-hidden">
                <BlurView
                    intensity={Platform.OS === 'ios' ? 80 : 100}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    className="pb-4"
                    style={{ paddingTop: insets.top }}
                >
                    {/* Top Bar: Title & Bell */}
                    <View className="px-5 pt-2 flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Radius
                            </Text>
                            <View className="flex-row items-center">
                                <MapPin size={12} color="#64748b" />
                                <Text className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    San Francisco, CA
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push("/notifications")}
                            className="relative"
                        >
                            <View className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-full shadow-sm backdrop-blur-md">
                                <Bell size={22} color={unreadCount > 0 ? "#ef4444" : (colorScheme === 'dark' ? '#fff' : '#0f172a')} />
                                {unreadCount > 0 && (
                                    <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border border-white dark:border-slate-800" />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Search & Filter */}
                    <View className="px-5 flex-row gap-3 mb-4">
                        <View className="flex-1 flex-row items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl px-4 py-3 border border-white/50 dark:border-white/10 shadow-sm">
                            <Search size={18} color="#9ca3af" />
                            <TextInput
                                placeholder="Search items..."
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className="flex-1 ml-3 text-base font-medium text-slate-900 dark:text-white"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsFilterModalVisible(true)}
                            className={`items-center justify-center w-12 rounded-2xl border ${Object.keys(filters).length > 0
                                ? "bg-blue-600 border-blue-600"
                                : "bg-slate-100/80 dark:bg-slate-800/80 border-white/50 dark:border-white/10"
                                } shadow-sm`}
                        >
                            <SlidersHorizontal
                                size={20}
                                color={Object.keys(filters).length > 0 ? "white" : (colorScheme === 'dark' ? '#fff' : '#0f172a')}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Categories (Stories) */}

                </BlurView>

                {/* Gradient Divider Bottom of Header */}
                <View className="h-[1px] w-full bg-slate-200/50 dark:bg-white/10" />
            </View>

            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                filters={filters}
                onApply={setFilters}
            />
        </View>
    );
}
