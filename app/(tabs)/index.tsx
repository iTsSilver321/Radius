import { GlassCard } from "@/src/components/ui/GlassCard"; // Keeping this if it exists, otherwise will remove
import { GlassView } from "@/components/ui/GlassView";
import { useAuth } from "@/src/features/auth/store";
import { fetchItems } from "@/src/features/feed/api";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { FilterModal } from "@/src/features/feed/components/FilterModal";
import { FeedFilters, Item } from "@/src/features/feed/types";
import { FeedSkeleton } from "@/src/features/feed/components/FeedSkeleton";
import { useLocation } from "@/src/features/location/hooks/useLocation";
import { useNotificationStore } from "@/src/features/notifications/store";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Bell,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Clock,
  ArrowUpLeft,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_SEARCHES_KEY = "radius_recent_searches";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load Recent Searches
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    })();
  }, []);

  const saveSearchTerm = async (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    // Remove if exists, then add to top
    const newSearches = [
      cleanTerm,
      ...recentSearches.filter((s) => s !== cleanTerm),
    ].slice(0, 10); // Keep max 10
    setRecentSearches(newSearches);
    await AsyncStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(newSearches),
    );
  };

  const removeSearchTerm = async (term: string) => {
    const newSearches = recentSearches.filter((s) => s !== term);
    setRecentSearches(newSearches);
    await AsyncStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(newSearches),
    );
  };

  const loadItems = async () => {
    try {
      // If performing a search, save it
      if (debouncedSearchQuery) {
        saveSearchTerm(debouncedSearchQuery);
      }

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

  // responsive layout calc
  const headerHeight = insets.top + 160;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header Background Gradient (Optional) */}

      {/* Main Content */}
      {loading ? (
        <FeedSkeleton />
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
            paddingTop: headerHeight, // Dynamic padding based on insets
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

      {/* Header Container */}
      <View
        className="absolute top-0 left-0 right-0 pointer-events-box-none z-50"
        style={{ zIndex: 100, elevation: 50 }} // Force top on Android
      >
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

          {/* Search Bar */}
          <View className="px-5 flex-row gap-3 mb-4">
            <View className="flex-1 flex-row items-center bg-white/5 rounded-2xl px-4 py-3 border border-white/10 shadow-sm">
              <Search size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search items..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Small delay to allow tap on recent items
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                className="flex-1 ml-3 text-base font-medium text-white"
              />
              {/* Clear Button */}
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
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
        </GlassView>
      </View>

      {/* Real Recent Searches Overlay */}
      {isSearchFocused &&
        searchQuery.length === 0 &&
        recentSearches.length > 0 && (
          <View className="absolute inset-0 z-40">
            <GlassView intensity={95} tint="dark" className="flex-1">
              <View
                style={{ paddingTop: headerHeight + 10 }}
                className="flex-1 px-5"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Recent Searches
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setRecentSearches([]);
                      AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
                    }}
                  >
                    <Text className="text-blue-400 text-xs font-bold">
                      Clear All
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView keyboardShouldPersistTaps="handled">
                  {recentSearches.map((term) => (
                    <View
                      key={term}
                      className="flex-row items-center justify-between py-3 border-b border-white/5"
                    >
                      <TouchableOpacity
                        className="flex-1 flex-row items-center"
                        onPress={() => {
                          setSearchQuery(term);
                          setIsSearchFocused(false);
                        }}
                      >
                        <Clock size={16} color="#64748b" className="mr-3" />
                        <Text className="text-white font-medium text-base ml-3">
                          {term}
                        </Text>
                      </TouchableOpacity>

                      <View className="flex-row items-center gap-4">
                        <TouchableOpacity onPress={() => setSearchQuery(term)}>
                          <ArrowUpLeft size={16} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeSearchTerm(term)}
                        >
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </GlassView>
          </View>
        )}

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}
