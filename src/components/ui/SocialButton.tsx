import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SocialButtonProps {
    type: "google" | "apple";
    onPress: () => void;
    isLoading?: boolean;
}

export const SocialButton = ({ type, onPress, isLoading }: SocialButtonProps) => {
    const isGoogle = type === "google";

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
            className={`flex-row items-center justify-center py-3.5 px-4 rounded-xl border ${isGoogle
                ? "bg-white border-gray-200 dark:bg-white/5 dark:border-white/10"
                : "bg-black border-black dark:bg-white dark:border-white"
                } mb-3 shadow-sm`}
        >
            <View className="mr-3">
                <FontAwesome
                    name={isGoogle ? "google" : "apple"}
                    size={20}
                    color={isGoogle ? "black" : "white"}
                    style={!isGoogle && { color: "white" }}
                />
                {/* Dark mode adjustment for text/icon is handled via className usually, but 'bg-white' above is explicit for Google */}
            </View>
            <Text
                className={`font-semibold text-base ${isGoogle
                    ? "text-gray-700 dark:text-gray-200"
                    : "text-white dark:text-black"
                    }`}
            >
                Sign in with {isGoogle ? "Google" : "Apple"}
            </Text>
        </TouchableOpacity>
    );
};
