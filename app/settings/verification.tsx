import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/features/auth/store";
import { updateProfile } from "@/src/features/profile/api";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Camera, CheckCircle, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"intro" | "upload" | "success">("intro");
    const [idImage, setIdImage] = useState<string | null>(null);

    const handleUpload = async () => {
        // Mock ID Selection
        setIdImage("https://placehold.co/600x400/png?text=ID+Card+Front");
    };

    const handleSubmit = async () => {
        if (!user || !idImage) return;

        setLoading(true);
        // Simulate Verification API Call delay
        setTimeout(async () => {
            try {
                // Determine random outcome for demo purposes, or just auto-verify
                // In a real app, this would create a 'verification_request'
                const success = true;

                if (success) {
                    // Auto-verify for demo
                    await updateProfile(user.id, { is_verified: true });
                    setStep("success");
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Verification request failed.");
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center p-4 bg-white dark:bg-card border-b border-gray-100 dark:border-white/5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-white/10"
                >
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                    Identity Verification
                </Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {step === "intro" && (
                    <View className="items-center py-8">
                        <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-6">
                            <ShieldCheck size={48} color="#3b82f6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                            Get Verified Badge
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-300 text-center leading-6 mb-8">
                            Verify your identity to build trust with buyers and sellers.
                            Verified users get a blue badge on their profile and items.
                        </Text>

                        <View className="w-full bg-white dark:bg-card p-6 rounded-2xl mb-8 border border-gray-100 dark:border-white/10">
                            <View className="flex-row items-center mb-4">
                                <CheckCircle size={20} color="#22c55e" />
                                <Text className="ml-3 text-gray-700 dark:text-gray-200">Gov-issued ID (Passport/License)</Text>
                            </View>
                            <View className="flex-row items-center mb-4">
                                <CheckCircle size={20} color="#22c55e" />
                                <Text className="ml-3 text-gray-700 dark:text-gray-200">Clear Selfie Photo</Text>
                            </View>
                            <View className="flex-row items-center">
                                <CheckCircle size={20} color="#22c55e" />
                                <Text className="ml-3 text-gray-700 dark:text-gray-200">~2 minutes process</Text>
                            </View>
                        </View>

                        <Button
                            title="Start Verification"
                            size="lg"
                            className="w-full"
                            onPress={() => setStep("upload")}
                        />
                    </View>
                )}

                {step === "upload" && (
                    <View className="py-4">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Upload ID
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 mb-6">
                            Please upload a clear photo of your Driving License or Passport.
                        </Text>

                        <TouchableOpacity
                            onPress={handleUpload}
                            className="w-full h-48 bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl items-center justify-center mb-8"
                        >
                            {idImage ? (
                                <Image source={{ uri: idImage }} className="w-full h-full rounded-2xl" contentFit="cover" />
                            ) : (
                                <>
                                    <Camera size={40} color="#9ca3af" className="mb-2" />
                                    <Text className="text-gray-500 dark:text-gray-400 font-medium">Tap to upload photo</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Button
                            title={loading ? "Verifying..." : "Submit for Verification"}
                            size="lg"
                            className="w-full"
                            disabled={!idImage || loading}
                            onPress={handleSubmit}
                        />
                    </View>
                )}

                {step === "success" && (
                    <View className="items-center py-20">
                        <View className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6">
                            <CheckCircle size={48} color="#22c55e" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                            You're Verified!
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-300 text-center leading-6 mb-8">
                            Your identity has been confirmed. The Verified Badge is now visible on your profile.
                        </Text>

                        <Button
                            title="Back to Profile"
                            size="lg"
                            className="w-full"
                            onPress={() => router.back()}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
