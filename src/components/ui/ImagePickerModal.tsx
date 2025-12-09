import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Camera, Image as ImageIcon } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { GlassView } from "@/components/ui/GlassView";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onCamera,
  onGallery,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/60 backdrop-blur-sm">
          <TouchableWithoutFeedback>
            <Animated.View
              entering={FadeInUp.springify().damping(15)}
              className="bg-gray-100 dark:bg-gray-900 rounded-t-3xl overflow-hidden"
            >
              <GlassView intensity={50} tint="dark" className="p-6 pb-12">
                <View className="items-center mb-6">
                  <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </View>

                <Text className="text-xl font-bold text-center text-gray-900 dark:text-white mb-8">
                  Upload Photo
                </Text>

                <View className="flex-row gap-4 mb-6">
                  <TouchableOpacity
                    onPress={onCamera}
                    className="flex-1 aspect-square items-center justify-center bg-blue-50 dark:bg-blue-500/10 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-500/30 active:bg-blue-100 dark:active:bg-blue-500/20"
                  >
                    <View className="w-16 h-16 items-center justify-center bg-blue-500 rounded-full shadow-lg shadow-blue-500/30 mb-4">
                      <Camera size={32} color="white" />
                    </View>
                    <Text className="font-bold text-lg text-gray-900 dark:text-white">
                      Camera
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onGallery}
                    className="flex-1 aspect-square items-center justify-center bg-purple-50 dark:bg-purple-500/10 rounded-3xl border-2 border-dashed border-purple-200 dark:border-purple-500/30 active:bg-purple-100 dark:active:bg-purple-500/20"
                  >
                    <View className="w-16 h-16 items-center justify-center bg-purple-500 rounded-full shadow-lg shadow-purple-500/30 mb-4">
                      <ImageIcon size={32} color="white" />
                    </View>
                    <Text className="font-bold text-lg text-gray-900 dark:text-white">
                      Gallery
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="w-full py-4 bg-gray-200 dark:bg-white/10 rounded-2xl items-center"
                >
                  <Text className="font-bold text-gray-900 dark:text-white">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </GlassView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
