import { GlassCard } from "@/src/components/ui/GlassCard"; // Keeping this if it exists, otherwise will remove
import { GlassView } from "@/components/ui/GlassView";
import { useAuth } from "@/src/features/auth/store";
import { fetchItems } from "@/src/features/feed/api";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { FilterModal } from "@/src/features/feed/components/FilterModal";
import { FeedFilters, Item } from "@/src/features/feed/types";
import { useLocation } from "@/src/features/location/hooks/useLocation";
import { useNotificationStore } from "@/src/features/notifications/store";
import { FlashList } from "@shopify/flash-list";
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
  const {
    location,
    address,
    errorMsg,
    loading: locationLoading,
  } = useLocation();
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
        userLocation: location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }
          : undefined,
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
  }, [debouncedSearchQuery, filters, location]); // Re-fetch if location changes and we might be sorting by distance

  useFocusEffect(
    useCallback(() => {
      loadItems();
      if (user) fetchNotifications(user.id);
    }, [user]),
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
                onPress={() =>
                  router.push({
                    pathname: "/item/[id]",
                    params: { id: item.id },
                  })
                }
              />
            </View>
          )}
          // @ts-ignore
          estimatedItemSize={280}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 170, // Increased to avoid overlap
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500">No items found.</Text>
            </View>
          }
        />
      )}

      {/* Glass Header */}
      <View className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-box-none">
        <GlassView
          intensity={Platform.OS === "ios" ? 80 : 100}
          tint="dark"
          className="pb-4 rounded-b-3xl"
          style={{ paddingTop: insets.top }}
        >
          {/* Top Bar: Title & Bell */}
          <View className="px-5 pt-2 flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-3xl font-extrabold text-white tracking-tight">
                Radius
              </Text>
              <View className="flex-row items-center">
                <MapPin size={12} color="#94a3b8" />
                <Text className="ml-1 text-xs font-semibold text-slate-400">
                  {locationLoading
                    ? "Locating..."
                    : errorMsg
                      ? "Location unavailable"
                      : address
                        ? `${address.city}, ${address.region || address.isoCountryCode}`
                        : "Unknown location"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              className="relative"
            >
              <View className="bg-white/10 p-2.5 rounded-full shadow-sm border border-white/10">
                <Bell size={22} color={unreadCount > 0 ? "#ef4444" : "#fff"} />
                {unreadCount > 0 && (
                  <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border border-slate-900" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Search & Filter */}
          <View className="px-5 flex-row gap-3 mb-4">
            <View className="flex-1 flex-row items-center bg-white/5 rounded-2xl px-4 py-3 border border-white/10 shadow-sm">
              <Search size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search items..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-base font-medium text-white"
              />
            </View>
            <TouchableOpacity
              onPress={() => setIsFilterModalVisible(true)}
              className={`items-center justify-center w-12 rounded-2xl border ${
                Object.keys(filters).length > 0
                  ? "bg-primary border-primary"
                  : "bg-white/5 border-white/10"
              } shadow-sm`}
            >
              <SlidersHorizontal
                size={20}
                color={Object.keys(filters).length > 0 ? "white" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          {/* Categories (Stories) */}
        </GlassView>
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
