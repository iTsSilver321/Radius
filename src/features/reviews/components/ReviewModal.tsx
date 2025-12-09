import { Button } from "@/src/components/ui/Button";
import { Star, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createReview } from "../api";

interface ReviewModalProps {
    visible: boolean;
    onClose: () => void;
    reviewerId: string;
    revieweeId: string;
    itemId: string;
    onSuccess: () => void;
}

export function ReviewModal({ visible, onClose, reviewerId, revieweeId, itemId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await createReview({
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                item_id: itemId,
                rating,
                comment,
            });
            onSuccess();
            onClose();
            setComment("");
            setRating(5);
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            Rate Seller
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mb-6 gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Star
                                    size={32}
                                    color={star <= rating ? "#fbbf24" : "#e5e7eb"}
                                    fill={star <= rating ? "#fbbf24" : "transparent"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Write a review
                    </Text>
                    <TextInput
                        className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-gray-900 dark:text-white min-h-[100px] mb-6"
                        placeholder="How was your experience?"
                        placeholderTextColor="#9ca3af"
                        multiline
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                    />

                    <Button
                        title="Submit Review"
                        onPress={handleSubmit}
                        loading={submitting}
                        variant="primary"
                        size="lg"
                    />
                </View>
            </View>
        </Modal>
    );
}
