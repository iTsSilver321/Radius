import { fetchItems } from "@/src/features/feed/api";
import { Item } from "@/src/features/feed/types";
import { MapCluster } from "@/src/features/map/components/MapCluster";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function MapScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await fetchItems();
                setItems(data);
            } catch (error) {
                console.error("Failed to load items for map:", error);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <MapCluster items={items} />
        </View>
    );
}
