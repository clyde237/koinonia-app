import { createAuthClient } from 'better-auth/react';
import { emailOTPClient, jwtClient } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const NEON_AUTH_URL = (process.env.EXPO_PUBLIC_NEON_AUTH_URL ?? (__DEV__ ? 'https://ep-fragrant-band-zan6tdb8.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth' : '')).replace(/\/$/, '');
if (!NEON_AUTH_URL) throw new Error('EXPO_PUBLIC_NEON_AUTH_URL doit être configurée pour cette version.');
// Origine de l'application autorisée dans Neon, distincte du schéma natif.
const authOrigin = process.env.EXPO_PUBLIC_AUTH_ORIGIN ?? (__DEV__ ? 'http://localhost:3000' : undefined);

export const authClient = createAuthClient({
  baseURL: NEON_AUTH_URL, basePath: new URL(NEON_AUTH_URL).pathname,
  fetchOptions: { timeout: 15000, headers: authOrigin ? { Origin: authOrigin } : {} },
  plugins: [
    expoClient({ scheme: 'koinonia', storagePrefix: `koinonia-${new URL(NEON_AUTH_URL).hostname.split('.')[0]}`, cookiePrefix: 'neon-auth', storage: SecureStore, disableCache: true }),
    jwtClient(), emailOTPClient(),
  ],
});

export async function getAccessToken() {
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error('Votre session a expiré. Reconnectez-vous.');
  return data.token;
}

export function accountError(error: { code?: string; message?: string } | null | undefined) {
  const messages: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: 'Adresse e-mail ou mot de passe incorrect.',
    USER_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse e-mail.',
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Un compte existe déjà avec cette adresse e-mail.',
    EMAIL_NOT_VERIFIED: 'Vérifiez votre adresse e-mail pour vous connecter.',
    PASSWORD_TOO_SHORT: 'Utilisez au moins 8 caractères pour votre mot de passe.',
    PASSWORD_TOO_LONG: 'Le mot de passe ne doit pas dépasser 128 caractères.',
    INVALID_PASSWORD: 'Le mot de passe actuel est incorrect.',
    INVALID_OTP: 'Le code est incorrect. Vérifiez-le et réessayez.',
    OTP_EXPIRED: 'Le code a expiré. Demandez un nouveau code.',
    TOO_MANY_ATTEMPTS: 'Trop de tentatives. Patientez avant de réessayer.',
    INVALID_ORIGIN: 'L’origine de l’application doit être autorisée dans Neon Auth.',
    MISSING_OR_NULL_ORIGIN: 'Configurez l’origine autorisée de l’application pour Neon Auth.',
  };
  return (error?.code && messages[error.code]) || 'Cette action est indisponible pour le moment. Vérifiez votre connexion et réessayez.';
}
