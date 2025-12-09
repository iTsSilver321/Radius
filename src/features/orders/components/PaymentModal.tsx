import { supabase } from "@/src/lib/supabase";
import { useUIStore } from "@/src/features/ui/store";
import { useAuth } from "@/src/features/auth/store";
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
import { createOrder } from "../api";

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    price: number;
    owner_id: string;
  };
}

export const PaymentModal = ({
  isVisible,
  onClose,
  item,
}: PaymentModalProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const { data, error } = await supabase.functions.invoke("payment-sheet", {
      body: {
        amount: item.price,
        // customerId: user?.id, // Don't send Supabase ID as Stripe Customer ID
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

  const handleBuy = async () => {
    if (!user) {
      showToast("You must be logged in to purchase.", "error");
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch Payment Params from Edge Function
      const { paymentIntent, ephemeralKey, customer } =
        await fetchPaymentSheetParams();

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Radius",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        returnURL: "radius://stripe-redirect", // Important for deep links
        customFlow: false,
      });

      if (initError) {
        showToast("Could not initialize payment.", "error");
        console.error(initError);
        return;
      }

      // 3. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        showToast(`Payment failed: ${paymentError.message}`, "error");
        return;
      }

      // 4. Create Order on Success
      await createOrder({
        buyer_id: user.id,
        seller_id: item.owner_id,
        item_id: item.id,
        amount: item.price,
        status: "paid",
        stripe_payment_intent_id: paymentIntent,
      });

      showToast("Payment successful! Order created.", "success");
      onClose();
    } catch (error: any) {
      console.error(error);
      showToast(
        error.message || "Something went wrong during checkout.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 h-[40%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-gray-900 dark:text-white text-xl font-bold">
              Checkout
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-gray-500 dark:text-gray-400 text-sm uppercase">
              Item
            </Text>
            <Text className="text-gray-900 dark:text-white text-lg font-medium">
              {item.title}
            </Text>
            <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-2">
              ${item.price}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-gray-500 dark:text-gray-400">
              Total (Fees included)
            </Text>
            <Text className="text-gray-900 dark:text-white font-bold">
              ${item.price}
            </Text>
          </View>

          <TouchableOpacity
            className={`bg-indigo-600 p-4 rounded-xl items-center shadow-lg shadow-indigo-500/30 ${loading ? "opacity-50" : ""}`}
            onPress={handleBuy}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Pay with Card
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-center text-gray-400 text-xs mt-4">
            Powered by Stripe. This is a demo transaction.
          </Text>
        </View>
      </View>
    </Modal>
  );
};
