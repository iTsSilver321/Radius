import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { Review } from "../api";

interface ReviewItemProps {
    review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
    return (
        <View className="mb-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
            <View className="flex-row items-center mb-2">
                <Image
                    source={{ uri: review.reviewer?.avatar_url || `https://ui-avatars.com/api/?name=${review.reviewer?.full_name || "User"}` }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    className="bg-gray-200"
                />
                <View className="ml-3 flex-1">
                    <Text className="font-bold text-gray-900 dark:text-white">
                        {review.reviewer?.full_name || "Anonymous"}
                    </Text>
                    <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={12}
                                color={star <= review.rating ? "#fbbf24" : "#e5e7eb"}
                                fill={star <= review.rating ? "#fbbf24" : "transparent"}
                            />
                        ))}
                    </View>
                </View>
                <Text className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                </Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-300 text-sm">
                {review.comment}
            </Text>
        </View>
    );
}
