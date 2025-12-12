import { Button } from "@/src/components/ui/Button";
import { X, ArrowDownUp, MapPin, Clock, DollarSign } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FeedFilters } from "@/src/features/feed/types";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FeedFilters;
  onApply: (filters: FeedFilters) => void;
}

const CATEGORIES = [
  "All",
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Sports",
  "Other",
];

type SortOption = {
  id: "newest" | "price_asc" | "price_desc" | "closest";
  label: string;
  icon: React.ReactNode;
};

export function FilterModal({
  visible,
  onClose,
  filters,
  onApply,
}: FilterModalProps) {
  const [category, setCategory] = useState(filters.category || "All");
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || "");
  const [sortBy, setSortBy] = useState<SortOption["id"]>(
    filters.sortBy || "newest",
  );
  const [radius, setRadius] = useState<number | undefined>(filters.radius);

  const sortOptions: SortOption[] = [
    {
      id: "newest",
      label: "Newest",
      icon: (
        <Clock size={16} color={sortBy === "newest" ? "white" : "#64748b"} />
      ),
    },
    {
      id: "closest",
      label: "Closest",
      icon: (
        <MapPin size={16} color={sortBy === "closest" ? "white" : "#64748b"} />
      ),
    },
    {
      id: "price_asc",
      label: "Price: Low to High",
      icon: (
        <DollarSign
          size={16}
          color={sortBy === "price_asc" ? "white" : "#64748b"}
        />
      ),
    },
    {
      id: "price_desc",
      label: "Price: High to Low",
      icon: (
        <ArrowDownUp
          size={16}
          color={sortBy === "price_desc" ? "white" : "#64748b"}
        />
      ),
    },
  ];

  const handleApply = () => {
    onApply({
      ...filters,
      category: category === "All" ? undefined : category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      radius,
    });
    onClose();
  };

  const handleReset = () => {
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setRadius(undefined);
    onApply({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-gray-50 dark:bg-slate-950">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Filters
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-gray-100 dark:bg-white/10 rounded-full"
          >
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Sort By */}
          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
            Sort By
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSortBy(option.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-xl border ${
                  sortBy === option.id
                    ? "bg-primary border-primary"
                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
                }`}
              >
                {option.icon}
                <Text
                  className={`ml-2 font-medium ${
                    sortBy === option.id
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories */}
          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${
                  category === cat
                    ? "bg-primary border-primary"
                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
                }`}
              >
                <Text
                  className={`font-medium ${
                    category === cat
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Radius */}
          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
            Distance Radius
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-8"
          >
            <View className="flex-row gap-2">
              {[undefined, 2, 5, 10, 25, 50].map((r) => (
                <TouchableOpacity
                  key={r || "any"}
                  onPress={() => setRadius(r)}
                  className={`px-4 py-2 rounded-full border ${
                    radius === r
                      ? "bg-primary border-primary"
                      : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      radius === r
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {r ? `${r} km` : "Anywhere"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Price Range */}
          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
            Price Range
          </Text>
          <View className="flex-row gap-4 mb-20">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Min Price</Text>
              <TextInput
                className="bg-white dark:bg-white/5 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium"
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
                className="bg-white dark:bg-white/5 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium"
                placeholder="$1000+"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
        </ScrollView>

        <View className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 safe-bottom">
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={handleReset}
              className="flex-1 h-14"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onPress={handleApply}
              className="flex-1 h-14"
            >
              Show Results
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
