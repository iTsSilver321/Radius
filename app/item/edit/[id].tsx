import { CategoryPicker } from "@/src/components/ui/CategoryPicker";
import { ImagePickerModal } from "@/src/components/ui/ImagePickerModal";
import { useAuth } from "@/src/features/auth/store";
import { useUIStore } from "@/src/features/ui/store";
import { updateItem, uploadImage } from "@/src/features/create/api";
import { fetchItemById } from "@/src/features/feed/api";
import { Item } from "@/src/features/feed/types";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  DollarSign,
  Image as ImageIcon,
  LayoutGrid,
  Tag,
  Type,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalItem, setOriginalItem] = useState<Item | null>(null);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const { showToast } = useUIStore();

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      const item = await fetchItemById(id!);
      if (item) {
        setOriginalItem(item);
        setImage(item.image_url || "");
        setTitle(item.title);
        setPrice(item.price.toString());
        setDescription(item.description || "");
        setCategory(item.category);
      }
    } catch (error) {
      console.error("Failed to load item:", error);
      showToast("Failed to load item details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !id) return;
    if (!image) {
      showToast("Please upload or take a photo of your item.", "error");
      return;
    }
    if (!title.trim()) {
      showToast("Please enter a title for your item.", "error");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      showToast("Please enter a valid price.", "error");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = image;
      if (image !== originalItem?.image_url) {
        const uploadedUrl = await uploadImage(image);
        if (!uploadedUrl) throw new Error("Failed to upload image.");
        imageUrl = uploadedUrl;
      }

      const { error } = await updateItem(id, {
        title,
        price: parseFloat(price),
        description,
        image_url: imageUrl,
        category,
      });

      if (error) throw error;

      showToast("Item updated successfully!", "success");
      router.back();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
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
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white dark:bg-white/10 rounded-full border border-slate-200 dark:border-white/10"
          >
            <ArrowLeft size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            Edit Item
          </Text>
          <View className="w-10" />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInDown.delay(100).duration(600).springify()}
            >
              <TouchableOpacity
                onPress={() => setPickerVisible(true)}
                className={`mb-8 h-64 w-full items-center justify-center rounded-3xl overflow-hidden border-2 border-dashed ${image ? "border-transparent" : "border-slate-300 dark:border-white/20"} bg-white/50 dark:bg-white/5`}
              >
                {image ? (
                  <View className="w-full h-full relative">
                    <Image
                      source={{ uri: image }}
                      className="h-full w-full"
                      style={{ resizeMode: "cover" }}
                    />
                    <View className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                      <Camera size={20} color="white" />
                    </View>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="h-16 w-16 mb-4 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                      <ImageIcon size={32} color="#3b82f6" />
                    </View>
                    <Text className="font-bold text-lg text-slate-700 dark:text-white">
                      Change Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View className="gap-5 pb-10">
              <Animated.View
                entering={FadeInDown.delay(200).duration(600).springify()}
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
                entering={FadeInDown.delay(300).duration(600).springify()}
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
                entering={FadeInDown.delay(400).duration(600).springify()}
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
                entering={FadeInDown.delay(500).duration(600).springify()}
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

              <Animated.View
                entering={FadeInUp.delay(600).duration(600).springify()}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitting}
                  className={`mt-4 w-full rounded-2xl py-4 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform ${submitting ? "bg-blue-400" : "bg-blue-600"}`}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-lg font-bold text-white">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

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
      </SafeAreaView>
    </View>
  );
}
