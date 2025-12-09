import { supabase } from "@/src/lib/supabase";
import * as Linking from "expo-linking";
import { create } from "zustand";
import { AuthState, Profile } from "./types";
import {
  configureGoogleSignIn,
  signInWithGoogle,
  signOutGoogle,
} from "./utils/google";
import { signInWithApple } from "./utils/apple";

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  initialized: false,

  signIn: async (email: string, password?: string) => {
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return {
          error: { message: "Email not verified. Please verify your email." },
        };
      }

      return { error };
    } else {
      // Magic Link Fallback
      const redirectUrl = Linking.createURL("/");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      return { error };
    }
  },

  signUp: async (email: string, password: string) => {
    // For OTP, we don't need a redirect URL, but Supabase might expect one or ignore it.
    // We'll remove the options to default to OTP if configured, or just let Supabase handle it.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // No options needed for default OTP behavior if "Confirm Email" is on
    });
    console.log("Sign Up Result:", { data, error });
    return { data, error };
  },

  verifyOtp: async (email: string, token: string) => {
    const cleanEmail = email.trim();
    const cleanToken = token.trim();

    console.log(
      `Verifying OTP for ${cleanEmail} with token ${cleanToken} (type: signup)`,
    );

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "signup",
    });

    console.log("Verify OTP Result:", { data, error });

    if (data.session) {
      set({ session: data.session, user: data.user });
      await get().refreshProfile();
    }

    return { error, session: data.session };
  },

  resendOtp: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return { error };
  },

  signOut: async () => {
    await signOutGoogle(); // Revoke Google Session
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      set({ profile: data as Profile });
    }
  },

  signInWithGoogle: async () => {
    try {
      const result = await signInWithGoogle();

      // Handle cancellation
      if (result.cancelled) {
        return { error: null };
      }

      const { idToken } = result;
      if (!idToken) throw new Error("No ID token returned");

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      return { error };
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      return { error };
    }
  },

  signInWithApple: async () => {
    try {
      const { identityToken, fullName } = await signInWithApple();
      if (!identityToken) throw new Error("No identity token returned");

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: identityToken,
      });

      // Optionally handle fullName update if needed (Supabase might handle it or we update profile manually)

      return { error };
    } catch (error: any) {
      console.error("Apple Sign-In Error:", error);
      return { error };
    }
  },
}));

// Configure Google Sign-In
configureGoogleSignIn();

// Initialize session listener
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuth.setState({
    session,
    user: session?.user ?? null,
    isLoading: false,
    initialized: true,
  });
  if (session) {
    useAuth.getState().refreshProfile();
  }
});

supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user && !session.user.email_confirmed_at) {
    // Force sign out if email is not confirmed
    await supabase.auth.signOut();
    useAuth.setState({
      session: null,
      user: null,
      isLoading: false,
    });
    return;
  }

  useAuth.setState({
    session,
    user: session?.user ?? null,
    isLoading: false,
  });
  if (session) {
    useAuth.getState().refreshProfile();
  }
});
