import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-8">
            <View className="mb-6 items-center justify-center rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                <Icon size={48} className="text-gray-400 dark:text-gray-500" color="#9ca3af" />
            </View>
            <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
                {title}
            </Text>
            <Text className="mb-8 text-center text-base text-gray-500 dark:text-gray-400">
                {description}
            </Text>
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    className="w-full max-w-xs"
                />
            )}
        </View>
    );
}
