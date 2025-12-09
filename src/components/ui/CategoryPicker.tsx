
import React from "react";
import { Modal, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { X } from "lucide-react-native";

interface CategoryPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (category: string) => void;
    selectedCategory: string;
}

const CATEGORIES = ["Electronics", "Furniture", "Clothing", "Books", "Sports", "Vehicles", "Real Estate", "Other"];

export function CategoryPicker({ visible, onClose, onSelect, selectedCategory }: CategoryPickerProps) {
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
            <View className="flex-1 bg-white dark:bg-background">
                <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">Select Category</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                        <X size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>
                <ScrollView className="flex-1 p-4">
                    <View className="flex-row flex-wrap gap-3">
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => { onSelect(cat); onClose(); }}
                                className={`px-4 py-3 rounded-xl border mb-2 w-full ${selectedCategory === cat
                                    ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
                                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                                    }`}
                            >
                                <Text className={`text-base font-semibold ${selectedCategory === cat ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-300"}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}
