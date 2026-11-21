import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Film, Headphones, X } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';
import { fonts } from '../lib/theme';
import type { BreakfastItem } from '../data/breakfasts';

type Props = {
  visible: boolean;
  onClose: () => void;
  breakfast: BreakfastItem | null;
  onSelectOption: (format: 'video' | 'audio') => void;
  isDownloading?: boolean;
};

export function DownloadModal({
  visible,
  onClose,
  breakfast,
  onSelectOption,
  isDownloading = false,
}: Props) {
  const { colors: c, isDark } = useTheme();

  if (!visible || !breakfast) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          style={[
            s.card,
            {
              backgroundColor: isDark ? '#111D30' : '#FFFFFF',
              borderColor: isDark ? 'rgba(78,234,216,0.2)' : 'rgba(0,169,157,0.15)',
            },
          ]}
          onPress={e => e.stopPropagation()}
        >
          {/* En-tête */}
          <View style={s.header}>
            <View style={s.headerTextCol}>
              <Text style={[s.title, { color: c.text }]}>Télécharger ce Breakfast</Text>
              <Text style={[s.subtitle, { color: c.muted }]} numberOfLines={1}>
                {breakfast.title}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer la boîte de dialogue"
              onPress={onClose}
              style={({ pressed }) => [
                s.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                pressed && s.pressed,
              ]}
            >
              <X size={18} color={c.text} />
            </Pressable>
          </View>

          <Text style={[s.instruction, { color: c.muted }]}>
            Choisissez le format de votre choix pour l’écoute ou le visionnage hors-connexion :
          </Text>

          {/* Option Vidéo */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Télécharger la vidéo MP4"
            disabled={isDownloading}
            onPress={() => {
              onSelectOption('video');
              onClose();
            }}
            style={({ pressed }) => [
              s.optionRow,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F4FBF9',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,169,157,0.12)',
              },
              pressed && s.pressed,
            ]}
          >
            <View style={[s.optionIconWrap, { backgroundColor: isDark ? '#18383B' : '#E0F7F4' }]}>
              <Film size={22} color={isDark ? '#4EEAD8' : '#00A99D'} strokeWidth={2} />
            </View>
            <View style={s.optionInfo}>
              <View style={s.optionTitleRow}>
                <Text style={[s.optionTitle, { color: c.text }]}>Vidéo complète</Text>
                <View style={[s.badge, { backgroundColor: isDark ? '#1C3146' : '#EAF4FE' }]}>
                  <Text style={[s.badgeText, { color: isDark ? '#4EEAD8' : '#007A70' }]}>MP4 · 48 Mo</Text>
                </View>
              </View>
              <Text style={[s.optionDesc, { color: c.muted }]}>
                Idéal pour regarder l’enseignement avec le texte et les points clés.
              </Text>
            </View>
          </Pressable>

          {/* Option Audio */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Télécharger l’audio MP3"
            disabled={isDownloading}
            onPress={() => {
              onSelectOption('audio');
              onClose();
            }}
            style={({ pressed }) => [
              s.optionRow,
              {
                marginTop: 12,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F4FBF9',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,169,157,0.12)',
              },
              pressed && s.pressed,
            ]}
          >
            <View style={[s.optionIconWrap, { backgroundColor: isDark ? '#172C42' : '#E6F4FE' }]}>
              <Headphones size={22} color={isDark ? '#5EE2FF' : '#0284C7'} strokeWidth={2} />
            </View>
            <View style={s.optionInfo}>
              <View style={s.optionTitleRow}>
                <Text style={[s.optionTitle, { color: c.text }]}>Audio seul</Text>
                <View style={[s.badge, { backgroundColor: isDark ? '#1C3146' : '#EAF4FE' }]}>
                  <Text style={[s.badgeText, { color: isDark ? '#5EE2FF' : '#0284C7' }]}>MP3 · 12 Mo</Text>
                </View>
              </View>
              <Text style={[s.optionDesc, { color: c.muted }]}>
                Format compact et léger pour écouter en arrière-plan ou en marchant.
              </Text>
            </View>
          </Pressable>

          {/* Bouton Annuler */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Annuler"
            onPress={onClose}
            style={({ pressed }) => [s.cancelBtn, pressed && s.pressed]}
          >
            <Text style={[s.cancelText, { color: c.muted }]}>Annuler</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,12,22,0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  optionDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});
