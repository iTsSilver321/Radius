import { supabase } from "@/src/lib/supabase";
import { useUIStore } from "@/src/features/ui/store";
import { useAuth } from "@/src/features/auth/store";
import { boostItem } from "@/src/features/feed/api";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Zap } from "lucide-react-native";

interface BoostModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
  };
  onSuccess: () => void;
}

const BOOST_TIERS = [
  { duration: 24, price: 2.99, label: "24 Hours" },
  { duration: 72, price: 4.99, label: "3 Days" },
  { duration: 168, price: 9.99, label: "7 Days", recommended: true },
  { duration: 720, price: 19.99, label: "30 Days" },
];

export const BoostModal = ({
  isVisible,
  onClose,
  item,
  onSuccess,
}: BoostModalProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(BOOST_TIERS[2]); // Default to 7 Days

  const fetchPaymentSheetParams = async () => {
    const { data, error } = await supabase.functions.invoke("payment-sheet", {
      body: {
        amount: selectedTier.price,
        // customerId: user?.id, // Let backend handle customer creation
      },
    });

    if (error) {
      console.error("Function Error:", error);
      throw new Error(error.message);
    }

    return {
      paymentIntent: data.paymentIntent,
      ephemeralKey: data.ephemeralKey,
      customer: data.customer,
    };
  };

  const handleBoost = async () => {
    if (!user) {
      showToast("You must be logged in to boost.", "error");
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch Payment Params
      const { paymentIntent, ephemeralKey, customer } =
        await fetchPaymentSheetParams();

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Radius",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        returnURL: "radius://stripe-redirect",
        customFlow: false,
      });

      if (initError) {
        showToast("Could not initialize payment.", "error");
        return;
      }

      // 3. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          showToast(`Payment failed: ${paymentError.message}`, "error");
        }
        return;
      }

      // 4. Apply Boost on Success
      await boostItem(item.id, selectedTier.duration);

      showToast(
        `Your item has been boosted for ${selectedTier.label}!`,
        "success",
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 h-[55%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="bg-yellow-100 p-2 rounded-full mr-3 dark:bg-yellow-900/30">
                <Zap size={20} color="#eab308" fill="#eab308" />
              </View>
              <Text className="text-gray-900 dark:text-white text-xl font-bold">
                Boost Listing
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 dark:text-gray-400 mb-6">
            Get more views by pinning &quot;{item.title}&quot; to the top of the
            feed.
          </Text>

          {/* Tiers */}
          <View className="flex-row flex-wrap justify-between gap-3 mb-8">
            {BOOST_TIERS.map((tier) => (
              <TouchableOpacity
                key={tier.duration}
                onPress={() => setSelectedTier(tier)}
                className={`w-[48%] p-4 rounded-xl border-2 ${
                  selectedTier.duration === tier.duration
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                {tier.recommended && (
                  <View className="absolute -top-3 left-0 right-0 items-center">
                    <View className="bg-yellow-500 px-2 py-0.5 rounded-full">
                      <Text className="text-white text-[10px] font-bold uppercase">
                        Best Value
                      </Text>
                    </View>
                  </View>
                )}
                <Text
                  className={`font-bold text-lg mb-1 ${
                    selectedTier.duration === tier.duration
                      ? "text-yellow-700 dark:text-yellow-500"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {tier.label}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">
                  ${tier.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            className={`bg-yellow-500 p-4 rounded-xl items-center shadow-lg shadow-yellow-500/30 ${loading ? "opacity-50" : ""}`}
            onPress={handleBoost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Pay ${selectedTier.price} & Boost
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
