import { GlassView } from "@/components/ui/GlassView";
import { fetchItems } from "@/src/features/feed/api";
import { FilterModal } from "@/src/features/feed/components/FilterModal";
import { FeedFilters, Item } from "@/src/features/feed/types";
import { MapCluster } from "@/src/features/map/components/MapCluster";
import { useUIStore } from "@/src/features/ui/store";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Region } from "react-native-maps";
import Animated, {
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

export default function MapScreen() {
  const { showToast } = useUIStore();
  const { lat, long } = useLocalSearchParams<{ lat: string; long: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [filters, setFilters] = useState<FeedFilters>({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Map State
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Handle incoming params (Navigation from Item Details)
  useEffect(() => {
    if (lat && long) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(long);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        // Update region request
        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }
  }, [lat, long]);

  const loadItems = async (bounds?: { northeast: any; southwest: any }) => {
    try {
      const data = await fetchItems({
        ...filters,
        searchQuery: debouncedSearchQuery,
        mapBounds: bounds, // Pass bounds if searching area, otherwise undefined
      });
      setItems(data);
      return data.length;
    } catch (error) {
      console.error("Failed to load items for map:", error);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  // Initial Load (and when filters changed)
  useEffect(() => {
    loadItems();
  }, [debouncedSearchQuery, filters]);

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
    if (!loading && !searching) {
      setIsDirty(true);
    }
  };

  const handleSearchArea = async () => {
    if (!currentRegion) return;
    setSearching(true);

    try {
      const northeast = {
        latitude: currentRegion.latitude + currentRegion.latitudeDelta / 2,
        longitude: currentRegion.longitude + currentRegion.longitudeDelta / 2,
      };
      const southwest = {
        latitude: currentRegion.latitude - currentRegion.latitudeDelta / 2,
        longitude: currentRegion.longitude - currentRegion.longitudeDelta / 2,
      };

      const count = await loadItems({ northeast, southwest });
      setIsDirty(false);

      showToast(`Found ${count} items in this area`, "success");
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <View className="flex-1 relative bg-white dark:bg-black">
      <MapCluster
        items={items}
        onRegionChangeComplete={handleRegionChange}
        // Pass explicit region if we just navigated here?
        // Actually MapCluster handles initialRegion, we might need a ref/prop to force update.
        // For now, let's rely on manual navigation or MapCluster handling 'region' prop if we add it.
        initialRegion={
          lat && long
            ? {
                latitude: parseFloat(lat),
                longitude: parseFloat(long),
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
      />

      {/* Header: Search & Filter */}
      <View className="absolute top-0 left-0 right-0 z-50 pointer-events-box-none">
        <GlassView
          intensity={Platform.OS === "ios" ? 80 : 100}
          tint="dark"
          className="pb-4 rounded-b-3xl"
          style={{ paddingTop: useSafeAreaInsets().top }}
        >
          <View className="px-5 flex-row gap-3 pt-2">
            <View className="flex-1 flex-row items-center bg-white/5 rounded-2xl px-4 py-3 border border-white/10 shadow-sm">
              <Search size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search this area..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-base font-medium text-white"
                returnKeyType="search"
                onSubmitEditing={handleSearchArea}
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
        </GlassView>
      </View>

      {/* Floating Search This View Button - MOVED TO BOTTOM */}
      <View
        className="absolute bottom-28 left-0 right-0 items-center z-40"
        pointerEvents="box-none"
      >
        {isDirty && (
          <Animated.View entering={FadeInUp.springify()} exiting={FadeOutDown}>
            <TouchableOpacity
              onPress={handleSearchArea}
              activeOpacity={0.8}
              disabled={searching}
            >
              <GlassView
                intensity={80}
                className="px-5 py-3 rounded-full flex-row items-center border border-white/20 overflow-hidden shadow-sm"
              >
                {searching ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    className="mr-2"
                  />
                ) : (
                  <Search size={16} color="#fff" className="mr-2" />
                )}
                <Text className="font-bold text-white text-sm">
                  {searching ? "Searching..." : "Search This View"}
                </Text>
              </GlassView>
            </TouchableOpacity>
          </Animated.View>
        )}
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
