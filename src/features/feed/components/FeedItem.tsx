import { LikeButton } from "@/src/components/ui/LikeButton";
import { Item } from "@/src/features/feed/types";
import { useLocationStore } from "@/src/features/location/hooks/useLocation";
import { calculateDistance } from "@/src/features/location/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FeedItemProps {
    item: Item;
    onPress: () => void;
}

export function FeedItem({ item, onPress }: FeedItemProps) {
    const userLocation = useLocationStore((state) => state.location);

    const distance = useMemo(() => {
        if (userLocation && item.location) {
            const dist = calculateDistance(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                item.location.latitude,
                item.location.longitude
            );
            return dist === "NaN km" ? null : dist;
        }
        return null;
    }, [userLocation, item.location]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="flex-1 mb-4 rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
            style={{ aspectRatio: 0.8 }} // Taller aspect ratio for "story" feel
        >
            <Image
                source={{ uri: item.image_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
            />

            {/* Like Button */}
            <View className="absolute top-3 right-3 z-10">
                <LikeButton itemId={item.id} />
            </View>

            {/* Status Badge */}
            {item.status !== 'active' && (
                <View className="absolute top-3 left-3 z-10 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">
                        {item.status}
                    </Text>
                </View>
            )}

            {/* Gradient Overlay */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%" }}
            />

            {/* Content */}
            <View className="absolute bottom-0 left-0 right-0 p-3">
                <Text
                    numberOfLines={1}
                    className="text-white font-bold text-lg leading-tight mb-1"
                >
                    {item.title}
                </Text>

                <View className="flex-row items-center justify-between">
                    <Text className="text-white font-extrabold text-xl">
                        ${item.price}
                    </Text>

                    {/* Location Badge */}
                    {distance && (
                        <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                            <MapPin size={10} color="white" />
                            <Text className="text-white text-[10px] ml-1 font-medium">
                                {distance}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
