import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export const signInWithApple = async () => {
    try {
        const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        });

        if (credential.identityToken) {
            return {
                identityToken: credential.identityToken,
                fullName: credential.fullName,
            };
        } else {
            throw new Error('No identity token provided');
        }
    } catch (e: any) {
        if (e.code === 'ERR_CANCELED') {
            return { cancelled: true };
        }
        throw e;
    }
};

export const isAppleAuthAvailable = async () => {
    return await AppleAuthentication.isAvailableAsync();
};
