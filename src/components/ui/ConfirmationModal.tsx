import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { GlassView } from "@/components/ui/GlassView";
import { AlertTriangle, CheckCircle } from "lucide-react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void; // Explicit cancel handler
  variant?: "default" | "destructive";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 justify-end bg-black/60 backdrop-blur-sm">
          <TouchableWithoutFeedback>
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              className="bg-gray-100 dark:bg-gray-900 rounded-t-3xl overflow-hidden"
            >
              <GlassView intensity={50} tint="dark" className="p-6 pb-10">
                <View className="items-center mb-6">
                  <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-6" />

                  <View
                    className={`w-16 h-16 items-center justify-center rounded-full mb-4 ${variant === "destructive" ? "bg-red-500/10" : "bg-blue-500/10"}`}
                  >
                    {variant === "destructive" ? (
                      <AlertTriangle
                        size={32}
                        color={
                          variant === "destructive" ? "#ef4444" : "#3b82f6"
                        }
                      />
                    ) : (
                      <CheckCircle size={32} color="#3b82f6" />
                    )}
                  </View>

                  <Text className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    {title}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-center px-4 leading-5">
                    {message}
                  </Text>
                </View>

                <View className="gap-3">
                  <TouchableOpacity
                    onPress={onConfirm}
                    className={`w-full py-4 rounded-2xl items-center ${variant === "destructive" ? "bg-red-500" : "bg-blue-600"}`}
                  >
                    <Text className="font-bold text-white text-lg">
                      {confirmText}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onCancel}
                    className="w-full py-4 bg-gray-200 dark:bg-white/10 rounded-2xl items-center"
                  >
                    <Text className="font-bold text-gray-900 dark:text-white text-lg">
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
