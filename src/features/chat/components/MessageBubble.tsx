import { Message } from "@/src/features/chat/types";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    return (
        <View
            className={`mb-3 max-w-[80%] ${isOwn ? "self-end" : "self-start"}`}
        >
            {isOwn ? (
                <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl rounded-tr-none px-4 py-3"
                >
                    <Text className="text-base text-white">{message.content}</Text>
                </LinearGradient>
            ) : (
                <View className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3 dark:bg-white/10">
                    <Text className="text-base text-gray-900 dark:text-white">
                        {message.content}
                    </Text>
                </View>
            )}
            <Text
                className={`mt-1 text-[10px] ${isOwn ? "text-right text-gray-500" : "text-left text-gray-400"
                    }`}
            >
                {format(new Date(message.created_at), "HH:mm")}
            </Text>
        </View>
    );
}
