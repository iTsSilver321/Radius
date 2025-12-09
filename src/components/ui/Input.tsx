import React, { useState } from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    containerClassName = "",
    className = "",
    onFocus,
    onBlur,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const borderColor = useSharedValue(0); // 0 = transparent/gray, 1 = primary

    const handleFocus = (e: any) => {
        setIsFocused(true);
        borderColor.value = withTiming(1);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        borderColor.value = withTiming(0);
        onBlur?.(e);
    };

    const animatedContainerStyle = useAnimatedStyle(() => ({
        borderColor: error
            ? "#ef4444" // Red-500
            : isFocused
                ? "#3b5998" // Primary
                : "rgba(255, 255, 255, 0.3)", // White/30
        borderWidth: 1,
    }));

    return (
        <View className={`space-y-2 ${containerClassName}`}>
            {label && (
                <Text className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </Text>
            )}

            <Animated.View
                style={animatedContainerStyle}
                className="flex-row items-center rounded-2xl bg-white/20 px-4 py-3"
            >
                {leftIcon && <View className="mr-3">{leftIcon}</View>}

                <TextInput
                    className={`flex-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 ${className}`}
                    placeholderTextColor="#9ca3af"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {rightIcon && <View className="ml-3">{rightIcon}</View>}
            </Animated.View>

            {error && (
                <Animated.Text
                    entering={FadeIn}
                    className="ml-1 text-sm text-red-500"
                >
                    {error}
                </Animated.Text>
            )}
        </View>
    );
}
