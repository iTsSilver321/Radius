import { useAuth } from "@/src/features/auth/store";
import { useUIStore } from "@/src/features/ui/store";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, RefreshCw } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp } = useAuth();
  const { showToast } = useUIStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    // Allow 6 to 8 digits to support both Supabase defaults
    if (!code || code.length < 6) {
      showToast("Please enter a valid verification code.", "error");
      return;
    }

    if (!email) {
      showToast("Email address is missing.", "error");
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, code);
    setLoading(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Email verified successfully!", "success");
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        className="absolute bottom-0 left-0 right-0 top-0"
      />
      <SafeAreaView className="flex-1 px-6 py-10">
        <Animated.View
          entering={FadeInUp.delay(200).duration(1000).springify()}
          className="mb-8"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-3xl font-extrabold text-white shadow-lg">
            Verify Email
          </Text>
          <Text className="mt-2 text-base text-blue-100">
            We sent a code to{" "}
            <Text className="font-bold text-white">{email}</Text>
          </Text>
        </Animated.View>

        <View>
          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
          >
            <View className="mb-6 flex-row items-center justify-center rounded-2xl bg-white/20 px-4 py-6 border border-white/30">
              <TextInput
                className="text-center text-4xl font-bold tracking-widest text-white placeholder:text-blue-200"
                placeholder="000000"
                placeholderTextColor="#bfdbfe"
                keyboardType="number-pad"
                maxLength={8}
                value={code}
                onChangeText={setCode}
                autoFocus
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(1000).springify()}
          >
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading}
              className={`mt-2 flex-row items-center justify-center rounded-2xl py-4 shadow-lg ${
                loading ? "bg-blue-400" : "bg-white"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#3b5998" />
              ) : (
                <>
                  <Text className="mr-2 text-lg font-bold text-blue-900">
                    Verify Now
                  </Text>
                  <CheckCircle color="#1e3a8a" size={20} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(800).duration(1000).springify()}
            className="mt-6 items-center"
          >
            <TouchableOpacity
              onPress={async () => {
                if (!email) {
                  showToast("No email address found.", "error");
                  return;
                }
                showToast("Sending...", "info");
                const { error } = await resendOtp(email);
                if (error) {
                  showToast(error.message, "error");
                } else {
                  showToast("Check your email for a new code.", "success");
                }
              }}
              className="flex-row items-center py-2"
            >
              <RefreshCw color="#bfdbfe" size={16} className="mr-2" />
              <Text className="font-medium text-blue-100">Resend Code</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
