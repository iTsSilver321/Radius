
import { useAuth } from "@/src/features/auth/store"; // Assuming you have an auth store
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createReport } from "../api";

interface ReportModalProps {
    isVisible: boolean;
    onClose: () => void;
    targetId: string;
    targetType: "item" | "profile";
}

const REPORT_REASONS = [
    "Inappropriate Content",
    "Spam or Scam",
    "Harassment",
    "Counterfeit Item",
    "Other",
];

export const ReportModal = ({ isVisible, onClose, targetId, targetType }: ReportModalProps) => {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { session } = useAuth(); // You might need to adjust based on your auth store

    const handleSubmit = async () => {
        if (!selectedReason) {
            Alert.alert("Error", "Please select a reason for reporting.");
            return;
        }

        if (!session?.user?.id) {
            Alert.alert("Error", "You must be logged in to report.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createReport({
                reporter_id: session.user.id,
                target_id: targetId,
                reason: `${selectedReason}: ${description}`,
            });
            Alert.alert("Success", "Report submitted successfully. Thank you for helping keep Radius safe.");
            onClose();
            setSelectedReason(null);
            setDescription("");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-[#121212] rounded-t-3xl p-6 h-[70%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-xl font-bold">Report {targetType === 'item' ? 'Item' : 'User'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-400 mb-4">Why are you reporting this?</Text>

                    <View className="gap-3 mb-6">
                        {REPORT_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                className={`p-4 rounded-xl border ${selectedReason === reason ? "border-indigo-500 bg-indigo-500/10" : "border-gray-700 bg-gray-800"
                                    }`}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <Text className={`font-medium ${selectedReason === reason ? "text-indigo-400" : "text-gray-300"}`}>
                                    {reason}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-gray-400 mb-2">Additional Details (Optional)</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl h-24 mb-6"
                        placeholder="Provide more context..."
                        placeholderTextColor="#6b7280"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        className={`bg-red-500 p-4 rounded-xl items-center ${isSubmitting ? "opacity-50" : ""}`}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Submit Report</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
