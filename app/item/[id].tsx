import { Button } from "@/src/components/ui/Button";
import { LikeButton } from "@/src/components/ui/LikeButton";
import { useAuth } from "@/src/features/auth/store";
import { createRoom } from "@/src/features/chat/api";
import { fetchItemById } from "@/src/features/feed/api";
import { Item } from "@/src/features/feed/types";
import { useLocation } from "@/src/features/location/hooks/useLocation";
import { calculateDistance } from "@/src/features/location/utils";
import { ReportModal } from "@/src/features/feed/components/ReportModal"; // New Import
import { ReviewModal } from "@/src/features/reviews/components/ReviewModal";
import { PaymentModal } from "@/src/features/orders/components/PaymentModal";
import { BoostModal } from "@/src/features/monetization/components/BoostModal"; // Corrected Import
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Flag,
  MapPin,
  MessageCircle,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react-native"; // Added Flag, Zap
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConfirmationModal } from "@/src/components/ui/ConfirmationModal";
import { useUIStore } from "@/src/features/ui/store";

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { location: userLocation } = useLocation();
  const { showToast } = useUIStore();

  // Confirmation State
  const [confirmation, setConfirmation] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "default" | "destructive";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "default",
  });

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isBoostModalVisible, setIsBoostModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  useEffect(() => {
    if (item?.location && userLocation) {
      const dist = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        item.location.latitude,
        item.location.longitude,
      );
      setDistance(dist);
    }
  }, [item, userLocation]);

  const loadItem = async () => {
    try {
      const data = await fetchItemById(id!);
      setItem(data);
    } catch (error) {
      console.error("Failed to load item:", error);
      showToast("Could not load item details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `Check out ${item.title} on Radius! Price: $${item.price}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessageSeller = async () => {
    if (!user || !item) return;

    if (user.id === item.owner_id) {
      router.push({
        pathname: "/item/edit/[id]",
        params: { id: item.id },
      } as any);
      return;
    }

    setContacting(true);
    try {
      const room = await createRoom(item.id, user.id, item.owner_id);
      router.push(`/chat/${room.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      showToast("Could not contact seller. Please try again.", "error");
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background">
        <Text className="text-gray-500">Item not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Hero Image */}
      <View className="relative h-96 w-full">
        <Image
          source={{ uri: item.image_url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.6)",
            "transparent",
            "transparent",
            "rgba(0,0,0,0.8)",
          ]}
          style={{ position: "absolute", inset: 0 }}
        />

        {/* Header Buttons */}
        <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <LikeButton itemId={item.id} size={28} />
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
            >
              <Share2 size={20} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Price & Title Overlay */}
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-500 px-3 py-1 rounded-full mr-3">
              <Text className="text-white font-bold text-xs uppercase tracking-wider">
                {item.category || "Other"}
              </Text>
            </View>
            {distance && (
              <View className="bg-black/40 px-2 py-1 rounded-full flex-row items-center backdrop-blur-md">
                <MapPin size={12} color="white" />
                <Text className="text-white text-xs ml-1">{distance} away</Text>
              </View>
            )}
          </View>
          <Text className="text-white text-3xl font-extrabold mb-1">
            {item.title}
          </Text>
          <Text className="text-white text-4xl font-bold">${item.price}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 -mt-6 rounded-t-3xl bg-gray-50 px-6 pt-8 dark:bg-background"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Seller Info */}
        <View className="flex-row items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-white/10">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              router.push({
                pathname: "/user/[id]",
                params: { id: item.owner_id },
              })
            }
          >
            <Image
              source={{
                uri:
                  item.owner?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${item.owner?.full_name || "User"}&background=random`,
              }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              className="bg-gray-200"
            />
            <View className="ml-3">
              <Text className="text-gray-900 font-bold text-lg dark:text-white">
                {item.owner?.full_name || "Radius User"}
              </Text>
              <View className="flex-row items-center">
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-gray-500 text-sm ml-1 dark:text-gray-400">
                  {item.owner?.reputation || 0} Reputation
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <View className="items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
            <ShieldCheck size={20} color="#16a34a" />
          </View>
        </View>

        {/* Location */}
        {item.location && (
          <View className="p-5 border-t border-gray-100 dark:border-white/10">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Location
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/map",
                  params: {
                    lat: item.location!.latitude,
                    long: item.location!.longitude,
                  },
                });
              }}
              className="bg-gray-100 dark:bg-white/10 rounded-2xl h-40 items-center justify-center overflow-hidden relative"
            >
              {/* Placeholder Map Visual */}
              <MapPin size={32} color="#3b82f6" />
              <Text className="text-blue-500 font-bold mt-2">View on Map</Text>

              {/* Pointer hint */}
              <View className="absolute top-2 right-2 bg-white/20 p-1 rounded-full">
                <ExternalLink size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        <Text className="text-gray-900 font-bold text-xl mb-3 dark:text-white">
          Description
        </Text>
        <Text className="text-gray-600 text-base leading-relaxed mb-8 dark:text-gray-300">
          {item.description || "No description provided."}
        </Text>

        {/* Safety Tips */}
        <View className="bg-blue-50 p-4 rounded-2xl mb-24 dark:bg-blue-900/20">
          <Text className="text-blue-800 font-bold mb-1 dark:text-blue-300">
            Safety Tip
          </Text>
          <Text className="text-blue-600 text-sm dark:text-blue-200">
            Always meet in a public place. Do not transfer money before seeing
            the item.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 dark:bg-card dark:border-white/5">
        {user?.id === item.owner_id ? (
          <View className="gap-3">
            <View className="flex-row gap-3">
              <Button
                title={
                  item.status === "active" ? "Mark Reserved" : "Mark Active"
                }
                onPress={() => {
                  const newStatus =
                    item.status === "active" ? "reserved" : "active";
                  setConfirmation({
                    visible: true,
                    title:
                      item.status === "active"
                        ? "Reserve Item?"
                        : "Activate Item?",
                    message:
                      item.status === "active"
                        ? "This will hide the item from the feed but keep it visible on your profile."
                        : "This will make the item visible to everyone in the feed again.",
                    variant: "default",
                    onConfirm: async () => {
                      setConfirmation((prev) => ({ ...prev, visible: false }));
                      if (!item) return;
                      try {
                        const { updateItemStatus } =
                          await import("@/src/features/feed/api");
                        await updateItemStatus(item.id, newStatus);
                        setItem({ ...item, status: newStatus });
                        showToast(`Item marked as ${newStatus}.`, "success");
                      } catch (e) {
                        showToast("Failed to update status.", "error");
                      }
                    },
                  });
                }}
                variant="outline"
                className="flex-1"
              />
              <Button
                title={item.status === "sold" ? "Mark Active" : "Mark Sold"}
                onPress={() => {
                  const newStatus = item.status === "sold" ? "active" : "sold";
                  setConfirmation({
                    visible: true,
                    title:
                      item.status === "sold"
                        ? "Reactivate Item?"
                        : "Mark as Sold?",
                    message:
                      item.status === "sold"
                        ? "This will make the item visible to everyone in the feed again."
                        : "Congratulations on the sale! This will move the item to your sold history.",
                    variant: "default", // Sold isn't destructive, it's a success state mostly
                    onConfirm: async () => {
                      setConfirmation((prev) => ({ ...prev, visible: false }));
                      if (!item) return;
                      try {
                        const { updateItemStatus } =
                          await import("@/src/features/feed/api");
                        await updateItemStatus(item.id, newStatus);
                        setItem({ ...item, status: newStatus });
                        showToast(`Item marked as ${newStatus}.`, "success");
                      } catch (e) {
                        showToast("Failed to update status.", "error");
                      }
                    },
                  });
                }}
                variant={item.status === "sold" ? "outline" : "secondary"}
                className="flex-1"
              />
            </View>

            {/* Boost Button - Only show if not sold */}
            {item.status !== "sold" && (
              <Button
                title={item.is_boosted ? "Boosted!" : "Boost Listing"}
                onPress={() => {
                  if (item.is_boosted) {
                    showToast("This item is already boosted.", "info");
                    return;
                  }
                  setIsBoostModalVisible(true);
                }}
                variant={item.is_boosted ? "outline" : "primary"}
                icon={
                  <Zap
                    size={20}
                    color={item.is_boosted ? "#eab308" : "white"}
                  />
                }
                className={
                  item.is_boosted ? "border-yellow-500" : "bg-yellow-500"
                }
                disabled={item.is_boosted}
              />
            )}

            <Button
              title="Edit Item Details"
              onPress={() =>
                router.push({
                  pathname: "/item/edit/[id]",
                  params: { id: item.id },
                } as any)
              }
              variant="outline"
              size="lg"
              icon={<Settings size={20} color="gray" />}
              className="w-full"
            />
          </View>
        ) : (
          <View className="gap-3">
            {/* Report Button - MOVED ABOVE */}
            <Button
              title="Report Item"
              onPress={() => setIsReportModalVisible(true)}
              variant="ghost"
              size="sm"
              className="w-full mb-1"
              icon={<Flag size={14} color="#9ca3af" />}
            />

            {item.status === "sold" ? (
              <View className="gap-3">
                <View className="bg-gray-100 dark:bg-white/10 p-4 rounded-xl items-center">
                  <Text className="text-gray-500 font-bold text-lg">
                    Item Sold
                  </Text>
                </View>
                <Button
                  title="Rate Seller"
                  onPress={() => setIsReviewModalVisible(true)}
                  variant="outline"
                  size="lg"
                  icon={<Star size={20} color="#4b5563" />}
                  className="w-full"
                />
              </View>
            ) : (
              <>
                <Button
                  title="Buy Now"
                  onPress={() => setIsPaymentModalVisible(true)}
                  variant="primary"
                  size="lg"
                  className="w-full bg-green-600 shadow-lg shadow-green-500/30"
                />

                <Button
                  title="Message Seller"
                  onPress={handleMessageSeller}
                  variant="secondary"
                  size="lg"
                  icon={<MessageCircle size={20} color="#4b5563" />}
                  loading={contacting}
                  className="w-full"
                />
              </>
            )}
          </View>
        )}
      </View>

      <ReviewModal
        visible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        reviewerId={user?.id || ""}
        revieweeId={item.owner_id}
        itemId={item.id}
        onSuccess={() => {
          showToast("Review submitted!", "success");
        }}
      />

      <PaymentModal
        isVisible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        item={{
          id: item.id,
          title: item.title,
          price: item.price,
          owner_id: item.owner_id,
        }}
      />

      <ReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        reporterId={user?.id || ""}
        targetId={item.id}
        type="item"
      />
      <BoostModal
        isVisible={isBoostModalVisible}
        onClose={() => setIsBoostModalVisible(false)}
        item={{
          id: item.id,
          title: item.title,
        }}
        onSuccess={() => {
          setItem({ ...item, is_boosted: true });
          showToast(`Your item has been boosted!`, "success");
        }}
      />

      <ConfirmationModal
        visible={confirmation.visible}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={() =>
          setConfirmation((prev) => ({ ...prev, visible: false }))
        }
        variant={confirmation.variant}
      />
    </View>
  );
}
