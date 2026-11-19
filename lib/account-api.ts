import Constants from 'expo-constants';
import { getAccessToken } from './auth-client';

const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? `http://${host}:3000` : '')).replace(/\/$/, '');

export type AccountProfile = {
  phone: string; country: string; city: string; church: string; noChurch: boolean;
  interests: string[]; period: string; requestedGroups: string[];
  breakfastNotifications: boolean; communityNotifications: boolean;
  onboardingStep: number; onboardingCompleted: boolean; photo: string | null;
};
export type ProfileInput = Omit<AccountProfile, 'photo' | 'onboardingCompleted'>;

export class AccountApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('L’adresse de l’API n’est pas configurée.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal, credentials: 'omit', headers: {
      Authorization: `Bearer ${token}`, 'X-Koinonia-Client': 'mobile', ...options.headers,
    } });
    const data = await response.json();
    if (!response.ok) throw new AccountApiError(typeof data?.error === 'string' ? data.error : 'Le service est indisponible.', response.status);
    return data as T;
  } catch (error) {
    if (error instanceof AccountApiError) throw error;
    throw new Error(error instanceof Error && error.message.includes('session') ? error.message : 'Impossible de joindre le service. Vérifiez votre connexion et que l’API est démarrée.');
  } finally { clearTimeout(timer); }
}

export const loadAccountProfile = () => request<AccountProfile>('/api/me/profile');
export const saveAccountProfile = (data: ProfileInput) => request<AccountProfile>('/api/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
export const deleteAccountPhoto = () => request('/api/me/avatar', { method: 'DELETE' });
export async function uploadAccountPhoto(uri: string) {
  const body = new FormData();
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  body.append('photo', { uri, name: `profil.${ext === 'png' || ext === 'webp' ? ext : 'jpg'}`, type: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg' } as unknown as Blob);
  return request<AccountProfile>('/api/me/avatar', { method: 'POST', body });
}
export const photoURL = (photo: string | null) => photo ? `${API_URL}${photo}` : null;
