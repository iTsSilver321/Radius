import { SocialButton } from "@/src/components/ui/SocialButton";
import { useAuth } from "@/src/features/auth/store";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, signInWithGoogle, signInWithApple } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ... (handleLogin remains same) ...

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await signInWithGoogle();
        setLoading(false);
        if (error) {
            Alert.alert("Google Sign-In Failed", error.message || "Unknown error");
        }
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        const { error } = await signInWithApple();
        setLoading(false);
        if (error) {
            // Basic error handling - cancellation is often ignored or handled silently
            if (error.code !== 'ERR_CANCELED') {
                Alert.alert("Apple Sign-In Failed", error.message || "Unknown error");
            }
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            if (error.message.includes("Email not verified")) {
                Alert.alert(
                    "Verification Required",
                    "Please verify your email to log in.",
                    [
                        {
                            text: "Verify Now",
                            onPress: () =>
                                router.push({
                                    pathname: "/auth/confirm",
                                    params: { email },
                                }),
                        },
                        { text: "Cancel", style: "cancel" },
                    ]
                );
            } else {
                Alert.alert("Login Failed", error.message);
            }
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
                    <Text className="text-5xl font-extrabold text-white shadow-lg">
                        Radius
                    </Text>
                    <Text className="mt-2 text-lg font-medium text-blue-100">
                        Welcome back, explorer.
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
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`mt-6 flex-row items-center justify-center rounded-2xl py-4 shadow-lg ${loading ? "bg-blue-400" : "bg-white"
                                }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#3b5998" />
                            ) : (
                                <>
                                    <Text className="mr-2 text-lg font-bold text-blue-900">
                                        Sign In
                                    </Text>
                                    <ArrowRight color="#1e3a8a" size={20} strokeWidth={2.5} />
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(900).duration(1000).springify()}
                    >
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-[1px] bg-blue-200" />
                            <Text className="mx-4 text-blue-100 text-sm">Or continue with</Text>
                            <View className="flex-1 h-[1px] bg-blue-200" />
                        </View>

                        <SocialButton
                            type="google"
                            onPress={handleGoogleLogin}
                            isLoading={loading}
                        />
                        <SocialButton
                            type="apple"
                            onPress={handleAppleLogin}
                            isLoading={loading}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(1000).duration(1000).springify()}
                        className="mt-6 flex-row justify-center"
                    >
                        <Text className="text-blue-100">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                            <Text className="font-bold text-white underline">Sign Up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}
