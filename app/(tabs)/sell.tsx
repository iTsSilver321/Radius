import { CategoryPicker } from "@/src/components/ui/CategoryPicker";
import { ImagePickerModal } from "@/src/components/ui/ImagePickerModal";
import { useUIStore } from "@/src/features/ui/store";
import { useAuth } from "@/src/features/auth/store";
import { useLocation } from "@/src/features/location/hooks/useLocation";
import { supabase } from "@/src/lib/supabase";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Camera,
  DollarSign,
  LayoutGrid,
  MapPin,
  Tag,
  Type,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SellScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useLocation();
  const { colorScheme } = useColorScheme();
  const { showToast } = useUIStore();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePost = async () => {
    if (!user) {
      showToast("You must be logged in to sell.", "error");
      return;
    }
    if (!title || !price || !image) {
      showToast("Please add a photo, title, and price.", "error");
      return;
    }
    if (!location) {
      showToast(
        "We need your location to show items to nearby users.",
        "error",
      );
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
        status: "active",
      });

      if (insertError) throw insertError;

      showToast("Item posted successfully!", "success");
      router.replace("/(tabs)");
      // Reset form
      setTitle("");
      setPrice("");
      // setImage(null);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    setPickerVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showToast("Camera permission is required.", "error");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleGallery = async () => {
    setPickerVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Gallery permission is required.", "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView className="flex-1 px-6">
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
          >
            <Text className="my-6 text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sell an Item
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
          >
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              className={`mb-8 h-64 w-full items-center justify-center rounded-3xl overflow-hidden border-2 border-dashed ${image ? "border-transparent" : "border-slate-300 dark:border-white/20"} bg-white/50 dark:bg-white/5`}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              ) : (
                <View className="items-center">
                  <View className="h-16 w-16 mb-4 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                    <Camera size={32} color="#3b82f6" />
                  </View>
                  <Text className="font-bold text-lg text-slate-700 dark:text-white">
                    Add Photo
                  </Text>
                  <Text className="mt-1 text-sm text-slate-400">
                    Tap to select from gallery
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View className="gap-5">
            <Animated.View
              entering={FadeInDown.delay(300).duration(600).springify()}
            >
              <View className="flex-row items-center rounded-2xl bg-white px-5 py-4 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                <Type size={20} color="#94a3b8" />
                <TextInput
                  placeholder="What are you selling?"
                  placeholderTextColor="#94a3b8"
                  className="ml-4 flex-1 text-lg font-medium text-slate-800 dark:text-white"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(600).springify()}
            >
              <View className="flex-row items-center rounded-2xl bg-white px-5 py-4 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                <DollarSign size={20} color="#94a3b8" />
                <TextInput
                  placeholder="Price"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  className="ml-4 flex-1 text-lg font-medium text-slate-800 dark:text-white"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(500).duration(600).springify()}
            >
              <TouchableOpacity
                onPress={() => setIsCategoryPickerVisible(true)}
                className="flex-row items-center rounded-2xl bg-white px-5 py-4 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm"
              >
                <LayoutGrid size={20} color="#94a3b8" />
                <Text className="ml-4 flex-1 text-lg font-medium text-slate-800 dark:text-white">
                  {category}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(600).duration(600).springify()}
            >
              <View className="flex-row items-start rounded-2xl bg-white px-5 py-4 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm min-h-[120px]">
                <Tag size={20} color="#94a3b8" className="mt-1" />
                <TextInput
                  placeholder="Description (Optional)"
                  placeholderTextColor="#94a3b8"
                  multiline
                  className="ml-4 flex-1 text-base text-slate-800 dark:text-white"
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                  style={{ height: 100 }}
                />
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(700).duration(600)}>
            <View className="flex-row items-center justify-center mt-6 mb-2">
              <MapPin size={14} className="text-blue-500 mr-1.5" />
              <Text className="text-blue-500 font-medium text-sm">
                {location ? "Location detected" : "Detecting location..."}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(800).duration(600).springify()}
          >
            <TouchableOpacity
              onPress={handlePost}
              disabled={uploading}
              className={`mt-4 mb-32 w-full rounded-2xl py-4 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform ${uploading ? "bg-blue-400" : "bg-blue-600"}`}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-lg font-bold text-white">
                  List Item
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <CategoryPicker
            visible={isCategoryPickerVisible}
            onClose={() => setIsCategoryPickerVisible(false)}
            onSelect={setCategory}
            selectedCategory={category}
          />

          <ImagePickerModal
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            onCamera={handleCamera}
            onGallery={handleGallery}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
