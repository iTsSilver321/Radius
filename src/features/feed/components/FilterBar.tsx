import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const CATEGORIES = [
    "All",
    "Electronics",
    "Fashion",
    "Home",
    "Vehicles",
    "Sports",
    "Books",
    "Gaming",
    "Art",
    "Other",
];

interface FilterBarProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export function FilterBar({ selectedCategory, onSelectCategory }: FilterBarProps) {
    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                        <TouchableOpacity
                            key={category}
                            onPress={() => onSelectCategory(category)}
                            activeOpacity={0.7}
                            className="rounded-full overflow-hidden"
                        >
                            {isSelected ? (
                                <LinearGradient
                                    colors={["#3b82f6", "#2563eb"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="px-5 py-2"
                                >
                                    <Text className="text-white font-semibold text-sm">
                                        {category}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View className="px-5 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full">
                                    <Text className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                        {category}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
