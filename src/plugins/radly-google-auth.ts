import { registerPlugin } from '@capacitor/core';

export interface RadlyGoogleAuthPlugin {
  /**
   * Sign in with Google
   * @returns Promise with Google user data and tokens
   */
  signIn(): Promise<{
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    nonce?: string;
    email?: string;
    familyName?: string;
    givenName?: string;
    displayName?: string;
    imageUrl?: string;
  }>;

  /**
   * Sign out from Google
   * @returns Promise
   */
  signOut(): Promise<void>;
}

const RadlyGoogleAuth = registerPlugin<RadlyGoogleAuthPlugin>('RadlyGoogleAuth');

export default RadlyGoogleAuth;

