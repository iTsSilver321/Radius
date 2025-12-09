import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
    title,
    onPress,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon,
    className = "",
    style,
}: ButtonProps) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.selectionAsync();
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const getContainerStyles = () => {
        let base = "flex-row items-center justify-center rounded-2xl";

        // Size
        if (size === "sm") base += " px-4 py-2";
        if (size === "md") base += " px-6 py-4";
        if (size === "lg") base += " px-8 py-5";

        // Variant (Non-gradient base styles)
        if (variant === "outline") base += " border-2 border-primary-light bg-transparent";
        if (variant === "ghost") base += " bg-transparent";
        if (variant === "secondary") base += " bg-secondary";

        return `${base} ${className}`;
    };

    const getTextStyles = () => {
        let base = "font-bold text-center";

        // Size
        if (size === "sm") base += " text-sm";
        if (size === "md") base += " text-base";
        if (size === "lg") base += " text-lg";

        // Variant
        if (variant === "primary") base += " text-white";
        if (variant === "secondary") base += " text-secondary-foreground";
        if (variant === "outline") base += " text-primary";
        if (variant === "ghost") base += " text-primary";

        return base;
    };

    const content = (
        <>
            {loading ? (
                <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#4c669f" : "white"} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={getTextStyles()}>{title}</Text>
                </>
            )}
        </>
    );

    if (variant === "primary") {
        return (
            <AnimatedTouchable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={[animatedStyle, style]}
                className={`overflow-hidden rounded-2xl shadow-lg ${className}`}
            >
                <LinearGradient
                    colors={["#4c669f", "#3b5998", "#192f6a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className={`flex-row items-center justify-center ${size === "sm" ? "px-4 py-2" : size === "md" ? "px-6 py-4" : "px-8 py-5"
                        }`}
                >
                    {content}
                </LinearGradient>
            </AnimatedTouchable>
        );
    }

    return (
        <AnimatedTouchable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            className={getContainerStyles()}
            style={[animatedStyle, style]}
        >
            {content}
        </AnimatedTouchable>
    );
}
