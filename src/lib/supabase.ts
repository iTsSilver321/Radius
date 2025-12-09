import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { AppState } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export const handleAuthDeepLink = async (url: string) => {
  try {
    // Parse the URL to get the query parameters
    const { queryParams } = Linking.parse(url);
    
    // Check for PKCE 'code'
    if (queryParams?.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(queryParams.code as string);
      if (error) throw error;
    }
    // Check for implicit 'access_token' (usually in hash, but Linking.parse might handle it or we need manual parsing)
    // Note: Linking.parse separates path, queryParams, etc. Hash is often in the URL string.
    // Supabase Magic Links with PKCE (default) use query params.
    
  } catch (error) {
    console.error("Deep link auth error:", error);
  }
};
