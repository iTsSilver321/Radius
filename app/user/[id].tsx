import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/features/auth/store";
import { FeedItem } from "@/src/features/feed/components/FeedItem";
import { Item } from "@/src/features/feed/types";
import { blockUser, checkIfBlocked, unblockUser } from "@/src/features/moderation/api";
import { Profile, fetchProfile, fetchUserItems } from "@/src/features/profile/api";
import { Review, fetchUserReviews } from "@/src/features/reviews/api";
import { ReviewItem } from "@/src/features/reviews/components/ReviewItem";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Ban, MessageCircle, ShieldCheck, Star, Trash } from "lucide-react-native";
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
const HEADER_HEIGHT = 250;

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");
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
                            }
                        }
                    ]
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
                Extrapolation.CLAMP
            ),
            transform: [
                {
                    scale: interpolate(
                        scrollY.value,
                        [-100, 0],
                        [1.2, 1],
                        Extrapolation.CLAMP
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
                Extrapolation.CLAMP
            ),
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, HEADER_HEIGHT - 100],
                        [0, -50],
                        Extrapolation.CLAMP
                    ),
                },
            ],
        };
    });

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background">
                <ActivityIndicator size="large" color="#3b5998" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background">
                <Text className="text-gray-500">User not found</Text>
            </View>
        );
    }

    const ListHeader = () => (
        <View className="pb-6 bg-gray-50 dark:bg-background -mt-12 rounded-t-[32px] overflow-hidden">
            <View className="items-center -mt-16 mb-4">
                <Animated.View style={avatarStyle} className="items-center">
                    <View className="p-1 bg-white dark:bg-background rounded-full shadow-lg">
                        <Image
                            source={{
                                uri: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || "User"}&background=random`,
                            }}
                            style={{ width: 120, height: 120, borderRadius: 60 }}
                            contentFit="cover"
                            className="border-4 border-white dark:border-background"
                        />
                    </View>
                    <View className="mt-4 items-center">
                        <Text className="text-2xl font-extrabold text-gray-900 dark:text-white text-center">
                            {profile.full_name || "Radius User"}
                        </Text>
                        {profile.is_verified && (
                            <View className="flex-row items-center mt-1 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                <ShieldCheck size={14} color="#3b82f6" />
                                <Text className="ml-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    VERIFIED SELLER
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(600)} className="px-6">
                {profile.bio && (
                    <Text className="text-center text-gray-600 dark:text-gray-300 mb-8 leading-6">
                        {profile.bio}
                    </Text>
                )}

                {/* Stats Row */}
                <View className="flex-row justify-between mb-8">
                    <Card variant="glass" className="flex-1 mr-2 items-center py-4 bg-orange-50 dark:bg-white/5 border-orange-100 dark:border-white/10">
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                                {profile.reputation || 0}
                            </Text>
                            <Star size={12} color="#f97316" fill="#f97316" style={{ marginLeft: 4 }} />
                        </View>
                        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                            Reputation
                        </Text>
                    </Card>
                    <Card variant="glass" className="flex-1 ml-2 items-center py-4 bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10">
                        <Text className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                            {items.length}
                        </Text>
                        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                            Active Listings
                        </Text>
                    </Card>
                </View>

                {/* Action Buttons */}
                {!isOwnProfile && (
                    <View className="flex-row gap-3 mb-8">
                        <Button
                            title="Message"
                            icon={<MessageCircle size={20} color="white" />}
                            className="flex-1 bg-primary dark:bg-primary-light"
                            onPress={() => {
                                router.push("/(tabs)/inbox");
                            }}
                        />
                        <Button
                            title={isBlocked ? "Unblock" : "Block"}
                            variant="outline"
                            icon={<Ban size={20} color={isBlocked ? "gray" : "#ef4444"} />}
                            className={`flex-1 ${isBlocked ? "" : "border-red-200"}`}
                            onPress={handleBlock}
                        />
                    </View>
                )}

                <View className="flex-row mb-6 border-b border-gray-200 dark:border-white/10">
                    <TouchableOpacity
                        onPress={() => setActiveTab("listings")}
                        className={`flex-1 items-center pb-3 ${activeTab === "listings" ? "border-b-2 border-primary dark:border-primary-light" : ""}`}
                    >
                        <Text className={`font-bold ${activeTab === "listings" ? "text-primary dark:text-primary-light" : "text-gray-400"}`}>
                            Listings ({items.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("reviews")}
                        className={`flex-1 items-center pb-3 ${activeTab === "reviews" ? "border-b-2 border-primary dark:border-primary-light" : ""}`}
                    >
                        <Text className={`font-bold ${activeTab === "reviews" ? "text-primary dark:text-primary-light" : "text-gray-400"}`}>
                            Reviews ({reviews.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Parallax Header Background */}
            <Animated.View style={[headerStyle, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 }]}>
                <LinearGradient
                    colors={["#4c669f", "#3b5998", "#192f6a"]}
                    style={{ flex: 1 }}
                />
                <View className="absolute inset-0 bg-black/20" />
            </Animated.View>

            {/* Back Button */}
            <SafeAreaView className="absolute top-0 left-0 z-50" edges={['top']}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="ml-4 mt-2 p-2 bg-white/20 backdrop-blur-md rounded-full"
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
            </SafeAreaView>

            <Animated.FlatList
                key={activeTab}
                data={(activeTab === "listings" ? items : reviews) as any}
                renderItem={({ item }) => (
                    activeTab === "listings" ? (
                        <View className="flex-1 p-2 relative">
                            <FeedItem
                                item={item as Item}
                                onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}
                            />
                            {isOwnProfile && (
                                <TouchableOpacity
                                    className="absolute top-2 left-2 bg-red-500/80 p-2 rounded-full backdrop-blur-sm z-50"
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
                                                            const { deleteItem } = await import("@/src/features/feed/api");
                                                            await deleteItem(item.id, user!.id);
                                                            // Optimistically remove from list
                                                            setItems(prev => prev.filter(i => i.id !== item.id));
                                                            Alert.alert("Success", "Item deleted.");
                                                        } catch (e) {
                                                            Alert.alert("Error", "Failed to delete item.");
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Trash size={16} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View className="px-6">
                            <ReviewItem review={item as Review} />
                        </View>
                    )
                )}
                keyExtractor={(item) => item.id}
                numColumns={activeTab === "listings" ? 2 : 1}
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 40, paddingHorizontal: activeTab === "listings" ? 8 : 0 }}
                columnWrapperStyle={activeTab === "listings" && items.length > 0 ? { justifyContent: "space-between" } : undefined}
                ListHeaderComponent={ListHeader}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" progressViewOffset={HEADER_HEIGHT + 20} />
                }
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <Text className="text-gray-500 dark:text-gray-400">
                            {activeTab === "listings" ? "No active listings found." : "No reviews yet."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
