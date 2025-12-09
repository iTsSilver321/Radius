import { BlurView } from "expo-blur";
import React from "react";
import { Platform, View, ViewProps } from "react-native";

// If cn doesn't exist, I'll inline a simple joiner
const clsx = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

interface GlassCardProps extends ViewProps {
    intensity?: number;
    className?: string;
    children: React.ReactNode;
}

export const GlassCard = ({ intensity = 50, className, children, style, ...props }: GlassCardProps) => {
    return (
        <View
            className={clsx("overflow-hidden rounded-2xl border border-white/20", className)}
            style={style}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint="default"
                className="absolute inset-0"
                style={Platform.OS === 'android' ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
            />
            <View className="relative z-10 p-4">
                {children}
            </View>
        </View>
    );
};
