import { BiometricProtection } from "@/src/components/BiometricProtection";
import { useAuth } from "@/src/features/auth/store";
import { useNotificationStore } from "@/src/features/notifications/store";
import { configureNotifications, registerForPushNotificationsAsync } from "@/src/features/notifications/utils";
import { useSavedStore } from "@/src/features/saved/store";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

import * as Linking from "expo-linking";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { session, initialized } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
        Inter_800ExtraBold,
    });

    useEffect(() => {
        if (!initialized || !navigationState?.key || !fontsLoaded) return;

        const inAuthGroup = segments[0] === "auth";

        if (session && inAuthGroup) {
            // Use setTimeout to avoid "Attempted to navigate before mounting" error
            setTimeout(() => router.replace("/(tabs)"), 0);
        } else if (!session && !inAuthGroup) {
            setTimeout(() => router.replace("/auth/login"), 0);
        }
    }, [session, initialized, segments, router, navigationState?.key, fontsLoaded]);

    // Initialize Saved Items Store
    useEffect(() => {
        if (session?.user) {
            useSavedStore.getState().fetchSavedIds(session.user.id);
        } else {
            useSavedStore.getState().reset();
        }
    }, [session]);

    useEffect(() => {
        if (initialized && fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [initialized, fontsLoaded]);

    // Handle deep links
    useEffect(() => {
        const handleUrl = ({ url }: { url: string }) => {
            import("@/src/lib/supabase").then(({ handleAuthDeepLink }) => {
                handleAuthDeepLink(url);
            });
        };

        const subscription = Linking.addEventListener("url", handleUrl);

        Linking.getInitialURL().then((url) => {
            if (url) handleUrl({ url });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Notifications Setup
    useEffect(() => {
        configureNotifications();
        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                useNotificationStore.getState().setExpoPushToken(token);
            }
        });

        // Listen for incoming notifications
        const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
            // Increment unread count when a notification is received
            useNotificationStore.getState().incrementUnreadCount();
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            // Handle notification tap (e.g., navigate to inbox)
            router.push("/(tabs)/inbox");
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    // Real-time Supabase Notifications
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (session?.user) {
            unsubscribe = useNotificationStore.getState().subscribeToNotifications(session.user.id);
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [session]);

    if (!fontsLoaded || !initialized || !navigationState?.key) {
        return null;
    }

    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            urlScheme="radius" // for 3D Secure redirection
            merchantIdentifier="merchant.com.radius" // optional, for Apple Pay
        >
            <SafeAreaProvider>
                <BiometricProtection />
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="item/edit/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="settings/index" options={{ headerShown: false }} />
                    <Stack.Screen name="settings/verification" options={{ headerShown: false }} />
                    <Stack.Screen name="settings/security" options={{ headerShown: false }} />
                    <Stack.Screen name="settings/blocked" options={{ headerShown: false }} />
                    <Stack.Screen name="settings/terms" options={{ headerShown: false }} />
                    <Stack.Screen name="settings/privacy" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
            </SafeAreaProvider>
        </StripeProvider>
    );
}
