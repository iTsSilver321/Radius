import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface CardProps {
    children: React.ReactNode;
    variant?: "glass" | "solid" | "gradient";
    className?: string;
    style?: ViewStyle;
    delay?: number;
}

export function Card({
    children,
    variant = "solid",
    className = "",
    style,
    delay = 0,
}: CardProps) {
    const getContainerStyles = () => {
        let base = "rounded-3xl p-4 shadow-sm";

        if (variant === "solid") base += " bg-white dark:bg-slate-900";
        if (variant === "glass") base += " bg-white/10 border border-white/20";

        return `${base} ${className}`;
    };

    const content = (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(600).springify()}
            className={getContainerStyles()}
            style={style}
        >
            {children}
        </Animated.View>
    );

    if (variant === "gradient") {
        return (
            <Animated.View
                entering={FadeInUp.delay(delay).duration(600).springify()}
                style={style}
                className={`overflow-hidden rounded-3xl shadow-lg ${className}`}
            >
                <LinearGradient
                    colors={["#ffffff", "#f0f9ff"]} // Subtle gradient
                    className="p-4"
                >
                    {children}
                </LinearGradient>
            </Animated.View>
        );
    }

    return content;
}
