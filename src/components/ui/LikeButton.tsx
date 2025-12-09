import { useAuth } from "@/src/features/auth/store";
import { useSavedStore } from "@/src/features/saved/store";
import * as Haptics from "expo-haptics";
import { Heart } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from "react-native-reanimated";

interface LikeButtonProps {
    itemId: string;
    size?: number;
    color?: string;
}

export const LikeButton = ({ itemId, size = 24, color = "white" }: LikeButtonProps) => {
    const { user } = useAuth();
    const { isSaved, toggleSave } = useSavedStore();
    const saved = isSaved(itemId);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = async () => {
        if (!user) return;

        // Haptic Feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Animation
        scale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );

        // Toggle State
        try {
            await toggleSave(itemId, user.id);
        } catch (error) {
            // Error handling is done in store (revert)
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <Animated.View style={animatedStyle}>
                <Heart
                    size={size}
                    color={saved ? "#ef4444" : color}
                    fill={saved ? "#ef4444" : "transparent"}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};
