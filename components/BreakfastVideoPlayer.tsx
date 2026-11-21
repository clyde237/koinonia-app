import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../lib/theme';
import type { BreakfastItem } from '../data/breakfasts';

type Props = {
  breakfast: BreakfastItem;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
  onTogglePlay?: (isPlaying: boolean) => void;
};

// Chargeur dynamique sécurisé pour expo-video afin d'éviter les plantages dans les tests Node
let expoVideoModule: typeof import('expo-video') | null | undefined;
function getExpoVideo() {
  if (expoVideoModule === undefined) {
    try {
      expoVideoModule = require('expo-video');
    } catch {
      expoVideoModule = null;
    }
  }
  return expoVideoModule;
}

export function BreakfastVideoPlayer({
  breakfast,
  autoPlay = true,
  style,
  onTogglePlay,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const totalDurationSec = breakfast.videoDurationSeconds || 600;

  // Référence pour le joueur expo-video si disponible
  const nativePlayerRef = useRef<any>(null);
  const expoVideo = getExpoVideo();

  // Initialisation du VideoPlayer expo-video si l'environnement natif est disponible
  useEffect(() => {
    let player: any = null;
    if (expoVideo?.createVideoPlayer) {
      try {
        const sourceUrl =
          (breakfast as any).videoUrl ||
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        player = expoVideo.createVideoPlayer(sourceUrl);
        // Configuration essentielle pour le maintien de l'audio en arrière-plan (WhatsApp, verrouillage, etc.)
        player.staysActiveInBackground = true;
        player.showNowPlayingNotification = true;
        player.muted = isMuted;

        if (autoPlay) {
          player.play();
        }

        nativePlayerRef.current = player;
      } catch {
        // Fallback simulation contrôlée
      }
    }

    return () => {
      if (player && typeof player.release === 'function') {
        try {
          player.release();
        } catch {
          // ignore
        }
      }
      nativePlayerRef.current = null;
    };
  }, [breakfast.id, autoPlay]);

  // Horloge de progression locale
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            if (onTogglePlay) onTogglePlay(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, totalDurationSec, onTogglePlay]);

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (onTogglePlay) onTogglePlay(nextState);

    const player = nativePlayerRef.current;
    if (player) {
      try {
        if (nextState) {
          player.play();
        } else {
          player.pause();
        }
      } catch {
        // ignore
      }
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const player = nativePlayerRef.current;
    if (player) {
      try {
        player.muted = nextMute;
      } catch {
        // ignore
      }
    }
  };

  const restartVideo = () => {
    setCurrentTimeSec(0);
    setIsPlaying(true);
    if (onTogglePlay) onTogglePlay(true);
    const player = nativePlayerRef.current;
    if (player) {
      try {
        player.currentTime = 0;
        player.play();
      } catch {
        // ignore
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTimeSec / totalDurationSec) * 100));

  return (
    <View style={[s.container, style]}>
      {/* Fond visuel / Vidéo */}
      <Image source={breakfast.image} resizeMode="cover" style={StyleSheet.absoluteFill} />

      {/* Rendu VideoView si le module natif expo-video est disponible */}
      {expoVideo?.VideoView && nativePlayerRef.current ? (
        <expoVideo.VideoView
          player={nativePlayerRef.current}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture
          startsPictureInPictureAutomatically
        />
      ) : null}

      {/* Gradient d'assombrissement pour lisibilité */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(8,18,28,0.25)', 'rgba(5,12,22,0.45)', 'rgba(5,12,22,0.85)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Bouton de lecture / pause central */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Mettre la vidéo en pause' : 'Lancer la lecture de la vidéo'}
        onPress={togglePlay}
        style={({ pressed }) => [s.centralPlayBtn, pressed && s.pressed]}
      >
        <LinearGradient
          colors={['#54DDD0', '#00A99D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.playGrad}
        >
          {isPlaying ? (
            <Pause size={28} color="#0B2929" fill="#0B2929" strokeWidth={2} />
          ) : (
            <Play size={28} color="#0B2929" fill="#0B2929" strokeWidth={2} style={{ marginLeft: 3 }} />
          )}
        </LinearGradient>
      </Pressable>

      {/* Barre de contrôles inférieure */}
      <View style={s.bottomControls}>
        <View style={s.timeRow}>
          <Text style={s.timerText}>
            {formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}
          </Text>

          <View style={s.actionsRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isMuted ? 'Activer le son' : 'Couper le son'}
              onPress={toggleMute}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              {isMuted ? (
                <VolumeX size={18} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Volume2 size={18} color="#FFFFFF" strokeWidth={2} />
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Recommencer depuis le début"
              onPress={restartVideo}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              <RotateCcw size={17} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Piste de progression */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0B1320',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralPlayBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  playGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timerText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4EEAD8',
    borderRadius: 2,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
});
