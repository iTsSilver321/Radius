import { Stack, useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { FlashList } from "@shopify/flash-list";
import { useAuth } from "@/src/features/auth/store";
import { fetchItemsByIds } from "@/src/features/feed/api";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { Item } from "@/src/features/feed/types";
import { useSavedStore } from "@/src/features/saved/store";

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { savedIds, fetchSavedIds } = useSavedStore();
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useColorScheme();

  const loadSavedItems = useCallback(async () => {
    setLoading(true);
    try {
      if (savedIds.size === 0 && user) {
        await fetchSavedIds(user.id);
      }
      // savedIds might be empty if fetchSavedIds hasn't finished or if empty.
      // But we should fetch based on CURRENT savedIds state after ensure fetch?
      // Actually useSavedStore usually handles fetch on mount if needed, but let's be safe.
      // Wait, fetchSavedIds updates the store.
      // We need to fetch DETAILS for the IDs in the store.

      const ids = Array.from(savedIds);
      if (ids.length > 0) {
        const items = await fetchItemsByIds(ids);
        setSavedItems(items);
      } else {
        setSavedItems([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [savedIds, user, fetchSavedIds]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadSavedItems();
      }
    }, [user, loadSavedItems]),
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-white/5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-white/10"
          >
            <ArrowLeft
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Items
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlashList
            data={savedItems}
            numColumns={2}
            renderItem={({ item }: { item: Item }) => (
              <View className="p-1 flex-1">
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
            estimatedItemSize={200}
            contentContainerStyle={{ padding: 8 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center mt-20 px-10">
                <Text className="text-center text-gray-500 dark:text-gray-400 text-lg">
                  No saved items yet.
                </Text>
                <Text className="text-center text-gray-400 dark:text-gray-600 mt-2">
                  Tap the heart icon on any item to save it for later.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
