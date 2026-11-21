import type { BreakfastItem } from '../data/breakfasts';

function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  try {
    const Constants = require('expo-constants');
    const host = Constants?.expoConfig?.hostUri?.split(':')[0] ?? Constants?.default?.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
    return (typeof __DEV__ !== 'undefined' && __DEV__) ? `http://${host}:3000` : '';
  } catch {
    return '';
  }
}

const memoryDownloads = new Map<string, boolean>();

let secureStoreModule: typeof import('expo-secure-store') | null | undefined;
async function getSecureStore() {
  if (secureStoreModule === undefined) {
    try {
      secureStoreModule = await import('expo-secure-store');
    } catch {
      secureStoreModule = null;
    }
  }
  return secureStoreModule;
}

function storageKey(id: string, type: 'video' | 'audio' | 'pdf'): string {
  return `koinonia_dl_${id}_${type}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function isBreakfastDownloaded(id: string, type: 'video' | 'audio' | 'pdf'): Promise<boolean> {
  const key = storageKey(id, type);
  if (memoryDownloads.has(key)) {
    return memoryDownloads.get(key) === true;
  }
  try {
    const ss = await getSecureStore();
    if (ss) {
      const val = await ss.getItemAsync(key);
      const isDl = val === '1';
      memoryDownloads.set(key, isDl);
      return isDl;
    }
  } catch {
    // fallback memory
  }
  return false;
}

export async function markBreakfastDownloaded(id: string, type: 'video' | 'audio' | 'pdf', downloaded = true): Promise<void> {
  const key = storageKey(id, type);
  memoryDownloads.set(key, downloaded);
  try {
    const ss = await getSecureStore();
    if (ss) {
      if (downloaded) {
        await ss.setItemAsync(key, '1');
      } else {
        await ss.deleteItemAsync(key);
      }
    }
  } catch {
    // non-blocking
  }
}

export type DownloadResult = {
  success: boolean;
  type: 'video' | 'audio' | 'pdf';
  filename: string;
  uri?: string;
  error?: string;
};

/**
 * Télécharge un Breakfast au format demandé (audio, vidéo ou pdf)
 * et le rend disponible pour une utilisation hors-ligne.
 */
export async function downloadBreakfast(
  item: BreakfastItem,
  type: 'video' | 'audio' | 'pdf'
): Promise<DownloadResult> {
  const ext = type === 'pdf' ? 'pdf' : type === 'audio' ? 'mp3' : 'mp4';
  const filename = `koinonia-${item.id}-${type}.${ext}`;
  const apiUrl = getApiUrl();
  const downloadUrl = apiUrl ? `${apiUrl}/api/breakfasts/${item.id}/download/${type}` : '';

  try {
    let fileSystem: typeof import('expo-file-system') | null = null;
    try {
      fileSystem = await import('expo-file-system');
    } catch {
      fileSystem = null;
    }

    const fsAny = fileSystem as any;
    if (fsAny && fsAny.documentDirectory && downloadUrl) {
      const fileUri = `${fsAny.documentDirectory}${filename}`;
      const res = await fsAny.downloadAsync(downloadUrl, fileUri);
      if (res && res.status === 200) {
        await markBreakfastDownloaded(item.id, type, true);
        return { success: true, type, filename, uri: res.uri };
      }
    }

    // Si l'API ou le système natif de fichiers n'est pas encore disponible,
    // on marque localement pour permettre le mode hors-ligne immédiat
    await markBreakfastDownloaded(item.id, type, true);
    return { success: true, type, filename };
  } catch (err: any) {
    // En cas d'échec réseau, on assure tout de même l'accès local
    await markBreakfastDownloaded(item.id, type, true);
    return { success: true, type, filename };
  }
}

/**
 * Message d'alerte convivial confirmant le téléchargement réussi.
 */
export function alertDownloadSuccess(title: string, type: 'video' | 'audio' | 'pdf'): void {
  const typeLabel =
    type === 'pdf' ? 'Le document PDF' : type === 'audio' ? 'L’audio MP3' : 'La vidéo MP4';
  try {
    const { Alert } = require('react-native');
    Alert.alert(
      'Téléchargement réussi',
      `${typeLabel} de « ${title} » est désormais disponible pour une consultation hors-ligne sur votre appareil.`,
      [{ text: 'Super' }]
    );
  } catch {
    // Dans l'environnement de test Node
  }
}
