import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../store";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const { signIn, verifyOtp } = useAuth();

    const handleSendOtp = async () => {
        if (!email) return Alert.alert("Error", "Please enter your email");
        setLoading(true);
        const { error } = await signIn(email);
        setLoading(false);
        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setStep("otp");
            Alert.alert("Success", "Check your email for the login code!");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return Alert.alert("Error", "Please enter the code");
        setLoading(true);
        const { error } = await verifyOtp(email, otp);
        setLoading(false);
        if (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View className="w-full max-w-sm">
            {step === "email" ? (
                <>
                    <Text className="mb-2 text-lg font-semibold text-gray-700">Sign In / Sign Up</Text>
                    <TextInput
                        className="mb-4 rounded-lg border border-gray-300 p-4 text-base"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TouchableOpacity
                        className="items-center rounded-lg bg-blue-600 p-4"
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-bold text-white">Send Code</Text>
                        )}
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text className="mb-2 text-lg font-semibold text-gray-700">Enter Code</Text>
                    <TextInput
                        className="mb-4 rounded-lg border border-gray-300 p-4 text-base"
                        placeholder="123456"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                    />
                    <TouchableOpacity
                        className="items-center rounded-lg bg-blue-600 p-4"
                        onPress={handleVerifyOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-bold text-white">Verify Code</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="mt-4 items-center"
                        onPress={() => setStep("email")}
                    >
                        <Text className="text-blue-600">Change Email</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}
