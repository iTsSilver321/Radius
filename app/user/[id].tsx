import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/features/auth/store";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { Item } from "@/src/features/feed/types";
import {
  blockUser,
  checkIfBlocked,
  unblockUser,
} from "@/src/features/moderation/api";
import {
  Profile,
  fetchProfile,
  fetchUserItems,
} from "@/src/features/profile/api";
import { Review, fetchUserReviews } from "@/src/features/reviews/api";
import { ReviewItem } from "@/src/features/reviews/components/ReviewItem";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Ban,
  MessageCircle,
  ShieldCheck,
  Star,
  Trash,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 220; // Reduced height for better fit on all screens

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">(
    "listings",
  );
  const [isBlocked, setIsBlocked] = useState(false);
  const scrollY = useSharedValue(0);

  const isOwnProfile = user?.id === id;

  const loadData = async () => {
    if (!id) return;
    try {
      const [profileData, itemsData, reviewsData] = await Promise.all([
        fetchProfile(id),
        fetchUserItems(id),
        fetchUserReviews(id),
      ]);
      setProfile(profileData);
      setItems(itemsData);
      setReviews(reviewsData);

      if (user && id && user.id !== id) {
        const blocked = await checkIfBlocked(user.id, id);
        setIsBlocked(blocked);
      }
    } catch (error) {
      console.error("Failed to load public profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleBlock = async () => {
    if (!user || !id) return;
    try {
      if (isBlocked) {
        await unblockUser(user.id, id);
        setIsBlocked(false);
        // Alert.alert("Success", "User unblocked.");
      } else {
        Alert.alert(
          "Block User",
          "Are you sure you want to block this user? You won't see their listings anymore.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Block",
              style: "destructive",
              onPress: async () => {
                await blockUser(user.id, id);
                setIsBlocked(true);
                // router.back();
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update block status.");
    }
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [-100, 0],
        [HEADER_HEIGHT + 100, HEADER_HEIGHT],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [-100, 0],
            [1.2, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const avatarStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT - 100],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - 100],
            [0, -50],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [1, 0.8],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#3b5998" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <Text className="text-gray-500">User not found</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View className="relative z-10">
      {/* White Sheet Background - Starts lower to create overlapping effect */}
      <View className="absolute top-12 left-0 right-0 bottom-0 bg-gray-50 dark:bg-black rounded-t-[32px]" />

      {/* Avatar Container - Needs to be on top and unclipped */}
      <View className="items-center px-6 pt-0">
        <Animated.View style={avatarStyle} className="items-center w-full z-20">
          <View className="p-1 bg-white/20 backdrop-blur-md rounded-full mb-3 shadow-2xl">
            <Image
              source={{
                uri:
                  profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${profile.full_name || "User"}&background=random`,
              }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              contentFit="cover"
              className="border-4 border-white dark:border-black bg-gray-200"
            />
          </View>

          <Text className="text-2xl font-extrabold text-slate-900 dark:text-white text-center tracking-tight mb-1">
            {profile.full_name || "Radius User"}
          </Text>

          {profile.is_verified && (
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              className="flex-row items-center mb-4 bg-blue-100/50 dark:bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30"
            >
              <ShieldCheck size={14} color="#3b82f6" />
              <Text className="ml-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide">
                VERIFIED SELLER
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* Content Container */}
      <View className="px-6 bg-gray-50 dark:bg-black pb-6">
        {profile.bio && (
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text className="text-center text-base text-slate-600 dark:text-slate-300 mb-8 leading-6 font-medium">
              {profile.bio}
            </Text>
          </Animated.View>
        )}

        {/* Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          className="flex-row justify-between mb-8 gap-4"
        >
          <View className="flex-1 items-center py-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm">
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {profile.reputation || 0}
              </Text>
              <Star
                size={14}
                color="#fbbf24"
                fill="#fbbf24"
                style={{ marginLeft: 4 }}
              />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
              Reputation
            </Text>
          </View>
          <View className="flex-1 items-center py-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm">
            <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {items.length}
            </Text>
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
              Listings
            </Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="flex-row gap-4 mb-8"
          >
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/inbox")}
              className="flex-1 bg-slate-900 dark:bg-white py-4 rounded-2xl items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <View className="flex-row items-center">
                <MessageCircle
                  size={20}
                  color={user ? "white" : "black"}
                  className="mr-2"
                />
                <Text className="font-bold text-white dark:text-black text-lg ml-2">
                  Message
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBlock}
              className={`px-5 py-4 rounded-2xl items-center justify-center border-2 ${isBlocked ? "bg-red-500 border-red-500" : "border-slate-200 dark:border-white/20"}`}
            >
              <Ban size={24} color={isBlocked ? "white" : "#ef4444"} />
            </TouchableOpacity>
          </Animated.View>
        )}

        <View className="flex-row mb-6 border-b border-slate-200 dark:border-white/10">
          <TouchableOpacity
            onPress={() => setActiveTab("listings")}
            className={`flex-1 items-center pb-4 ${activeTab === "listings" ? "border-b-2 border-slate-900 dark:border-white" : ""}`}
          >
            <Text
              className={`font-bold text-lg ${activeTab === "listings" ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
            >
              Listings{" "}
              <Text className="text-sm font-medium opacity-60">
                ({items.length})
              </Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("reviews")}
            className={`flex-1 items-center pb-4 ${activeTab === "reviews" ? "border-b-2 border-slate-900 dark:border-white" : ""}`}
          >
            <Text
              className={`font-bold text-lg ${activeTab === "reviews" ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
            >
              Reviews{" "}
              <Text className="text-sm font-medium opacity-60">
                ({reviews.length})
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Parallax Header Background */}
      <Animated.View
        style={[
          headerStyle,
          { position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 },
        ]}
      >
        {/* Fallback gradient or image could go here if we had a cover photo */}
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#334155"]} // Dark slate gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
        <View className="absolute inset-0 bg-black/20" />
      </Animated.View>

      {/* Back Button */}
      <SafeAreaView className="absolute top-0 left-0 z-50" edges={["top"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="ml-4 mt-2 h-12 w-12 items-center justify-center bg-black/30 backdrop-blur-md rounded-full border border-white/20"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.FlatList
        key={activeTab}
        data={(activeTab === "listings" ? items : reviews) as any}
        renderItem={({ item, index }) =>
          activeTab === "listings" ? (
            <Animated.View
              entering={FadeInDown.delay(index * 100)
                .duration(600)
                .springify()}
              className="flex-1 p-2 relative"
            >
              <FeedItem
                item={item as Item}
                onPress={() =>
                  router.push({
                    pathname: "/item/[id]",
                    params: { id: item.id },
                  })
                }
              />
              {isOwnProfile && (
                <TouchableOpacity
                  className="absolute top-4 left-4 bg-red-500/80 p-2 rounded-full backdrop-blur-sm z-50 shadow-sm"
                  onPress={() => {
                    Alert.alert(
                      "Delete Item",
                      "Are you sure you want to delete this listing?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              const { deleteItem } =
                                await import("@/src/features/feed/api");
                              await deleteItem(item.id, user!.id);
                              // Optimistically remove from list
                              setItems((prev) =>
                                prev.filter((i) => i.id !== item.id),
                              );
                              Alert.alert("Success", "Item deleted.");
                            } catch (e) {
                              Alert.alert("Error", "Failed to delete item.");
                            }
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Trash size={16} color="white" />
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            <View className="px-6 mb-4">
              <ReviewItem review={item as Review} />
            </View>
          )
        }
        keyExtractor={(item) => item.id}
        numColumns={activeTab === "listings" ? 2 : 1}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT - 30,
          paddingBottom: 100,
          paddingHorizontal: activeTab === "listings" ? 8 : 0,
        }}
        columnWrapperStyle={
          activeTab === "listings" && items.length > 0
            ? { justifyContent: "space-between" }
            : undefined
        }
        ListHeaderComponent={ListHeader}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            progressViewOffset={HEADER_HEIGHT + 20}
          />
        }
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-gray-500 dark:text-gray-400 font-medium">
              {activeTab === "listings"
                ? "No active listings found."
                : "No reviews yet."}
            </Text>
          </View>
        }
      />
    </View>
  );
}
