import { Button } from "@/src/components/ui/Button";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FeedFilters } from "../api";

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: FeedFilters;
    onApply: (filters: FeedFilters) => void;
}

const CATEGORIES = ["All", "Electronics", "Furniture", "Clothing", "Books", "Sports", "Other"];

export function FilterModal({ visible, onClose, filters, onApply }: FilterModalProps) {
    const [category, setCategory] = useState(filters.category || "All");
    const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || "");
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || "");

    const handleApply = () => {
        onApply({
            ...filters,
            category: category === "All" ? undefined : category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        });
        onClose();
    };

    const handleReset = () => {
        setCategory("All");
        setMinPrice("");
        setMaxPrice("");
        onApply({});
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-gray-50 dark:bg-background">
                <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">Filters</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                        <X size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Categories */}
                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        Category
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full border ${category === cat
                                    ? "bg-primary border-primary"
                                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
                                    }`}
                            >
                                <Text
                                    className={`font-medium ${category === cat ? "text-white" : "text-gray-700 dark:text-gray-300"
                                        }`}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Price Range */}
                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        Price Range
                    </Text>
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Min Price</Text>
                            <TextInput
                                className="bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                placeholder="$0"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={minPrice}
                                onChangeText={setMinPrice}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Max Price</Text>
                            <TextInput
                                className="bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                placeholder="$1000+"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={maxPrice}
                                onChangeText={setMaxPrice}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-card safe-bottom">
                    <View className="flex-row gap-3">
                        <Button
                            title="Reset"
                            variant="outline"
                            onPress={handleReset}
                            className="flex-1"
                        />
                        <Button
                            title="Apply Filters"
                            variant="primary"
                            onPress={handleApply}
                            className="flex-1"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}
