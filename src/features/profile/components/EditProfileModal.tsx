import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Profile, updateProfile } from "@/src/features/profile/api";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    profile: Profile;
    onUpdate: () => void;
}

export function EditProfileModal({
    visible,
    onClose,
    profile,
    onUpdate,
}: EditProfileModalProps) {
    const [fullName, setFullName] = useState(profile.full_name || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(profile.id, {
                full_name: fullName,
                bio: bio,
            });
            onUpdate();
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 px-6"
                >
                    <View className="flex-row items-center justify-between py-4">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            Edit Profile
                        </Text>
                        <TouchableOpacity onPress={onClose} className="rounded-full bg-gray-100 p-2 dark:bg-white/10">
                            <X size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-6 space-y-6">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={fullName}
                            onChangeText={setFullName}
                            containerClassName="bg-gray-50 dark:bg-white/5"
                        />

                        <Input
                            label="Bio"
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            className="h-32 text-top"
                            containerClassName="bg-gray-50 dark:bg-white/5 items-start pt-3"
                        />

                        <Button
                            title="Save Changes"
                            onPress={handleSave}
                            loading={loading}
                            className="mt-4"
                        />
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}
