import { CategoryPicker } from "@/src/components/ui/CategoryPicker";
import { useAuth } from "@/src/features/auth/store";
import { useLocation } from "@/src/features/location/hooks/useLocation";
import { supabase } from "@/src/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, DollarSign, LayoutGrid, MapPin, Tag, Type } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SellScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { location } = useLocation();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Electronics");
    const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = async () => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to sell.");
            return;
        }
        if (!title || !price || !image) {
            Alert.alert("Missing Fields", "Please add a photo, title, and price.");
            return;
        }
        if (!location) {
            Alert.alert("Location Required", "We need your location to show items to nearby users.");
            return;
        }

        setUploading(true);
        try {
            const fileName = `${user.id}/${Date.now()}.jpg`;
            // Mock upload for now
            const publicUrl = "https://picsum.photos/400/300";

            const { error: insertError } = await supabase.from("items").insert({
                title,
                description,
                price: parseFloat(price),
                seller_id: user.id,
                image_url: publicUrl,
                category,
                location: `POINT(${location.coords.longitude} ${location.coords.latitude})`,
                status: 'active'
            });

            if (insertError) throw insertError;

            Alert.alert("Success", "Item posted successfully!");
            router.replace("/(tabs)");
            // Reset form
            setTitle("");
            setPrice("");
            // setImage(null);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background" edges={["top"]}>
            <ScrollView className="p-6">
                <Text className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">
                    Sell an Item
                </Text>

                <TouchableOpacity
                    onPress={pickImage}
                    className="mb-6 h-48 w-full items-center justify-center rounded-2xl bg-white border-2 border-dashed border-slate-300 dark:bg-white/5 dark:border-white/10"
                >
                    {image ? (
                        <Image source={{ uri: image }} className="h-full w-full rounded-2xl" />
                    ) : (
                        <View className="items-center">
                            <Camera size={32} color="#64748b" />
                            <Text className="mt-2 font-medium text-slate-500 dark:text-slate-400">Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View className="space-y-4 gap-4">
                    <View className="flex-row items-center rounded-xl bg-white px-4 py-3 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                        <Type size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="What are you selling?"
                            placeholderTextColor="#94a3b8"
                            className="ml-3 flex-1 text-base text-slate-800 dark:text-white"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View className="flex-row items-center rounded-xl bg-white px-4 py-3 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                        <DollarSign size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Price"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            className="ml-3 flex-1 text-base text-slate-800 dark:text-white"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsCategoryPickerVisible(true)}
                        className="flex-row items-center rounded-xl bg-white px-4 py-3 dark:bg-white/5 border border-slate-100 dark:border-white/10"
                    >
                        <LayoutGrid size={20} color="#94a3b8" />
                        <Text className="ml-3 flex-1 text-base text-slate-800 dark:text-white">
                            {category}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-start rounded-xl bg-white px-4 py-3 dark:bg-white/5 border border-slate-100 dark:border-white/10 h-32">
                        <Tag size={20} color="#94a3b8" className="mt-1" />
                        <TextInput
                            placeholder="Description (Optional)"
                            placeholderTextColor="#94a3b8"
                            multiline
                            className="ml-3 flex-1 text-base text-slate-800 dark:text-white"
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View className="flex-row items-center justify-center p-2">
                        <MapPin size={16} className="text-gray-400 mr-2" />
                        <Text className="text-gray-500 text-sm">
                            {location ? "Location detected" : "Detecting location..."}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handlePost}
                    disabled={uploading}
                    className={`mt-8 mb-10 flex-row items-center justify-center rounded-xl py-4 shadow-lg ${uploading ? "bg-blue-400" : "bg-blue-600"
                        }`}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-lg font-bold text-white">List Item</Text>
                    )}
                </TouchableOpacity>

                <CategoryPicker
                    visible={isCategoryPickerVisible}
                    onClose={() => setIsCategoryPickerVisible(false)}
                    onSelect={setCategory}
                    selectedCategory={category}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

