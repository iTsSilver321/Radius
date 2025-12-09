import { useAuth } from "@/src/features/auth/store";
import { useUIStore } from "@/src/features/ui/store";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Lock, Mail, UserPlus } from "lucide-react-native";
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

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showToast } = useUIStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    // @ts-ignore - signUp is defined in store but TS might lag
    const { data, error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      showToast(error.message, "error");
    } else if (data?.session) {
      // Auto-login successful (Email confirmation disabled)
    } else {
      router.push({
        pathname: "/auth/confirm",
        params: { email },
      });
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        className="absolute bottom-0 left-0 right-0 top-0"
      />
      <SafeAreaView className="flex-1 justify-center px-6">
        <Animated.View
          entering={FadeInUp.delay(200).duration(1000).springify()}
          className="mb-10 items-center"
        >
          <Text className="text-4xl font-extrabold text-white shadow-lg">
            Join Radius
          </Text>
          <Text className="mt-2 text-lg font-medium text-blue-100">
            Start your journey today.
          </Text>
        </Animated.View>

        <View className="space-y-4">
          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
          >
            <View className="flex-row items-center rounded-2xl bg-white/20 px-4 py-3 border border-white/30">
              <Mail color="white" size={20} />
              <TextInput
                className="ml-3 flex-1 text-base text-white placeholder:text-blue-200"
                placeholder="Email Address"
                placeholderTextColor="#bfdbfe"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(1000).springify()}
          >
            <View className="flex-row items-center rounded-2xl bg-white/20 px-4 py-3 border border-white/30">
              <Lock color="white" size={20} />
              <TextInput
                className="ml-3 flex-1 text-base text-white placeholder:text-blue-200"
                placeholder="Password"
                placeholderTextColor="#bfdbfe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(800).duration(1000).springify()}
          >
            <View className="flex-row items-center rounded-2xl bg-white/20 px-4 py-3 border border-white/30">
              <Lock color="white" size={20} />
              <TextInput
                className="ml-3 flex-1 text-base text-white placeholder:text-blue-200"
                placeholder="Confirm Password"
                placeholderTextColor="#bfdbfe"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(1000).duration(1000).springify()}
          >
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className={`mt-6 flex-row items-center justify-center rounded-2xl py-4 shadow-lg ${
                loading ? "bg-blue-400" : "bg-white"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#3b5998" />
              ) : (
                <>
                  <Text className="mr-2 text-lg font-bold text-blue-900">
                    Sign Up
                  </Text>
                  <UserPlus color="#1e3a8a" size={20} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(1200).duration(1000).springify()}
            className="mt-6 flex-row justify-center"
          >
            <Text className="text-blue-100">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text className="font-bold text-white underline">Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
