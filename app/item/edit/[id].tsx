import { useAuth } from "@/src/features/auth/store";
import { updateItem, uploadImage } from "@/src/features/create/api";
import { fetchItemById } from "@/src/features/feed/api";
import { Item } from "@/src/features/feed/types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Camera, DollarSign, Image as ImageIcon, Type, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditItemScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Other");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [originalItem, setOriginalItem] = useState<Item | null>(null);

    const CATEGORIES = [
        "Electronics",
        "Fashion",
        "Home",
        "Vehicles",
        "Sports",
        "Books",
        "Gaming",
        "Art",
        "Other",
    ];

    useEffect(() => {
        if (id) {
            loadItem();
        }
    }, [id]);

    const loadItem = async () => {
        try {
            const item = await fetchItemById(id!);
            if (item) {
                setOriginalItem(item);
                setImage(item.image_url || "");
                setTitle(item.title);
                setPrice(item.price.toString());
                setDescription(item.description || "");
                setCategory(item.category);
            }
        } catch (error) {
            console.error("Failed to load item:", error);
            Alert.alert("Error", "Failed to load item details.");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Gallery permission is required.");
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status !== 'granted') {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Camera permission is required.");
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!user || !id) return;

        if (!image) {
            Alert.alert("Missing Image", "Please upload or take a photo of your item.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Missing Title", "Please enter a title for your item.");
            return;
        }

        if (!price.trim() || isNaN(parseFloat(price))) {
            Alert.alert("Invalid Price", "Please enter a valid price.");
            return;
        }

        setSubmitting(true);

        try {
            let imageUrl = image;
            // Only upload if the image has changed (starts with file://)
            if (image !== originalItem?.image_url) {
                const uploadedUrl = await uploadImage(image);
                if (!uploadedUrl) {
                    throw new Error("Failed to upload image.");
                }
                imageUrl = uploadedUrl;
            }

            // Optional: Update location if needed, for now we keep original location
            // or we could ask user if they want to update location

            const { error } = await updateItem(id, {
                title,
                price: parseFloat(price),
                description,
                image_url: imageUrl,
                category,
            });

            if (error) throw error;

            Alert.alert("Success", "Item updated successfully!");
            router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderInput = (
        value: string,
        onChangeText: (text: string) => void,
        placeholder: string,
        icon: React.ReactNode,
        keyboardType: "default" | "numeric" = "default",
        multiline = false
    ) => (
        <View style={styles.inputWrapper}>
            <View style={[
                styles.inputContainer,
                isDark ? styles.inputContainerDark : styles.inputContainerLight,
                multiline && styles.inputContainerMultiline
            ]}>
                <View style={[styles.iconContainer, multiline && styles.iconContainerMultiline]}>
                    {icon}
                </View>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    style={[
                        styles.input,
                        isDark ? styles.textDark : styles.textLight,
                        multiline && styles.inputMultiline
                    ]}
                />
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background-dark">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <SafeAreaView style={styles.flex1} edges={['top']}>
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={isDark ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
                        Edit Item
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.flex1}
                >
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Image Picker Area */}
                        <View style={styles.imageSection}>
                            {image ? (
                                <View style={[styles.imagePreviewContainer, isDark ? styles.cardDark : styles.cardLight]}>
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.imagePreview}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setImage(null)}
                                        style={styles.removeImageButton}
                                    >
                                        <X size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.imagePickerRow}>
                                    <TouchableOpacity
                                        onPress={pickImage}
                                        style={[styles.pickerButton, isDark ? styles.pickerButtonDark : styles.pickerButtonLight]}
                                    >
                                        <View style={[styles.pickerIconBg, styles.bgBlue]}>
                                            <ImageIcon size={24} color="#3b82f6" />
                                        </View>
                                        <Text style={[styles.pickerLabel, isDark ? styles.textDark : styles.textGray]}>Gallery</Text>
                                        <Text style={styles.pickerSubLabel}>Select photo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={takePhoto}
                                        style={[styles.pickerButton, isDark ? styles.pickerButtonDark : styles.pickerButtonLight]}
                                    >
                                        <View style={[styles.pickerIconBg, styles.bgPurple]}>
                                            <Camera size={24} color="#8b5cf6" />
                                        </View>
                                        <Text style={[styles.pickerLabel, isDark ? styles.textDark : styles.textGray]}>Camera</Text>
                                        <Text style={styles.pickerSubLabel}>Take photo</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {renderInput(title, setTitle, "What are you selling?", <Type size={20} color="#9ca3af" />)}
                            {renderInput(price, setPrice, "Price", <DollarSign size={20} color="#9ca3af" />, "numeric")}

                            {/* Category Selection */}
                            <View>
                                <Text style={[styles.label, isDark ? styles.textDark : styles.textGray]}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                                    {CATEGORIES.map((cat) => {
                                        const isSelected = category === cat;
                                        return (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setCategory(cat)}
                                                style={[
                                                    styles.categoryChip,
                                                    isSelected ? styles.categoryChipSelected : (isDark ? styles.categoryChipDark : styles.categoryChipLight)
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.categoryText,
                                                    isSelected ? styles.textWhite : (isDark ? styles.textGray : styles.textGray)
                                                ]}>
                                                    {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {renderInput(description, setDescription, "Describe your item...", null, "default", true)}

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={submitting}
                                style={styles.submitButtonContainer}
                            >
                                <LinearGradient
                                    colors={["#4c669f", "#3b5998", "#192f6a"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.submitButtonGradient}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Update Item</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: '#f9fafb', // gray-50
    },
    containerDark: {
        backgroundColor: '#111827', // gray-900
    },
    flex1: {
        flex: 1,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
    },
    textLight: {
        color: '#111827', // gray-900
    },
    textDark: {
        color: '#ffffff',
    },
    textGray: {
        color: '#374151', // gray-700
    },
    imageSection: {
        marginBottom: 32,
    },
    imagePreviewContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        position: 'relative',
    },
    cardLight: {
        backgroundColor: '#ffffff',
    },
    cardDark: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    imagePreview: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
        borderRadius: 9999,
    },
    imagePickerRow: {
        flexDirection: 'row',
        gap: 16,
    },
    pickerButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        paddingVertical: 40,
    },
    pickerButtonLight: {
        borderColor: '#d1d5db', // gray-300
        backgroundColor: '#ffffff',
    },
    pickerButtonDark: {
        borderColor: '#374151', // gray-700
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    pickerIconBg: {
        height: 48,
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        marginBottom: 12,
    },
    bgBlue: {
        backgroundColor: '#eff6ff', // blue-50
    },
    bgPurple: {
        backgroundColor: '#f5f3ff', // purple-50
    },
    pickerLabel: {
        fontWeight: '600',
        fontSize: 16,
    },
    pickerSubLabel: {
        fontSize: 12,
        color: '#9ca3af', // gray-400
        marginTop: 4,
    },
    formContainer: {
        gap: 20,
    },
    inputWrapper: {
        marginBottom: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    inputContainerLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    inputContainerDark: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputContainerMultiline: {
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginRight: 12,
    },
    iconContainerMultiline: {
        marginTop: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    inputMultiline: {
        height: 128,
        textAlignVertical: 'top',
    },
    submitButtonContainer: {
        marginBottom: 40,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    categoryContainer: {
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryChipLight: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
    },
    categoryChipDark: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    categoryChipSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    textWhite: {
        color: '#ffffff',
    },
});
