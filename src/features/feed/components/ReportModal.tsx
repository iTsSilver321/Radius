import { Button } from "@/src/components/ui/Button";
// import { reportUser } from "@/src/features/moderation/api"; // Removed invalid import
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    reporterId: string;
    targetId: string; // Could be user ID or item ID
    type: "user" | "item";
    onSuccess?: () => void;
}

export function ReportModal({ visible, onClose, reporterId, targetId, type, onSuccess }: ReportModalProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReport = async () => {
        if (!reason.trim()) {
            Alert.alert("Error", "Please provide a reason for the report.");
            return;
        }

        setLoading(true);
        try {
            // For now, we'll use a generic console log or call a mock function if the API isn't ready.
            // In a real app, this would hit the 'reports' table.
            const { supabase } = await import("@/src/lib/supabase");
            const { error } = await supabase
                .from("reports") // Ensure this table exists or use an existing one
                .insert({
                    reporter_id: reporterId,
                    target_id: targetId,
                    reason: reason,
                    status: "pending",
                    // You might want a 'type' column in your reports table if it supports both users and items
                    // For now we will assume the schema supports it or we'll add it.
                });

            if (error) throw error;

            Alert.alert("Report Submitted", "Thank you. Our team will review this report.");
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Report error:", error);
            Alert.alert("Error", "Failed to submit report.");
        } finally {
            setLoading(false);
            setReason("");
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            Report {type === "item" ? "Item" : "User"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} className="text-gray-500" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-600 dark:text-gray-300 mb-4">
                        Select a reason for reporting:
                    </Text>

                    <View className="gap-2 mb-4">
                        {["Spam", "Inappropriate Content", "Scam", "Other"].map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setReason(r === "Other" ? "" : r)}
                                className={`p-4 rounded-xl border ${reason === r || (r === "Other" && !["Spam", "Inappropriate Content", "Scam"].includes(reason) && reason !== "")
                                    ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
                                    : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                    }`}
                            >
                                <Text className={`font-medium ${reason === r || (r === "Other" && !["Spam", "Inappropriate Content", "Scam"].includes(reason) && reason !== "")
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-900 dark:text-gray-300"
                                    }`}>
                                    {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {(!["Spam", "Inappropriate Content", "Scam"].includes(reason) && reason !== "") || reason === "" ? (
                        <TextInput
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Please provide more details..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-gray-900 dark:text-white mb-6 h-24"
                            textAlignVertical="top"
                        />
                    ) : null}

                    <Button
                        title="Submit Report"
                        onPress={handleReport}
                        loading={loading}
                        variant="primary"
                        className="w-full bg-red-600"
                    />
                </View>
            </View>
        </Modal>
    );
}
