import { useAuth } from "@/src/features/auth/store";
import { fetchMessages, sendMessage } from "@/src/features/chat/api";
import { MessageBubble } from "@/src/features/chat/components/MessageBubble";
import { Message } from "@/src/features/chat/types";
import { supabase } from "@/src/lib/supabase";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!id) return;

        loadMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`room:${id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${id}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => [...prev, newMessage]);
                    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const loadMessages = async () => {
        try {
            const data = await fetchMessages(id!);
            setMessages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !user || !id) return;

        const content = inputText.trim();
        setInputText("");

        try {
            await sendMessage(id, user.id, content);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background-dark">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/5">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color="#3b82f6" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                        Chat
                    </Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => (
                        <MessageBubble message={item} isOwn={item.sender_id === user?.id} />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />

                {/* Input Area */}
                <View className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/5">
                    <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-2 dark:bg-white/10">
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            placeholderTextColor="#9ca3af"
                            className="flex-1 text-base text-gray-900 dark:text-white mr-2 max-h-24"
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                            className={`rounded-full p-2 ${inputText.trim() ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                            <Send size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
