import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Ensure this is set in .env
        offlineAccess: true,
        scopes: ['profile', 'email'],
    });
};

export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        
        if (userInfo.data?.idToken) {
            return { idToken: userInfo.data.idToken, user: userInfo.data.user };
        } else {
            throw new Error('No ID token present!');
        }
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            return { cancelled: true };
        } else if (error.code === statusCodes.IN_PROGRESS) {
            throw new Error('Sign in is in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Play services not available or outdated');
        } else {
            throw error;
        }
    }
};

export const signOutGoogle = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error(error);
    }
};
