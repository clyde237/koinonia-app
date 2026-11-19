import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, FlatList, ScrollView, StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Check } from 'lucide-react-native';
import { Country, COUNTRIES, POPULAR_COUNTRIES, searchCountries } from '../data/countries';
import { fonts, homeTheme } from '../lib/theme';

export interface CountryPickerModalProps {
  visible: boolean;
  selectedCountryName?: string;
  selectedCountry?: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
  colors?: {
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    border?: string;
    action?: string;
    onAction?: string;
  };
}

export function CountryPickerModal({
  visible,
  selectedCountryName,
  selectedCountry,
  onSelect,
  onClose,
  colors,
}: CountryPickerModalProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => searchCountries(search), [search]);

  const c = {
    background: colors?.background || homeTheme.canvas,
    surface: colors?.surface || homeTheme.surface,
    text: colors?.text || homeTheme.text,
    muted: colors?.muted || homeTheme.muted,
    border: colors?.border || homeTheme.divider,
    action: colors?.action || homeTheme.action,
    onAction: colors?.onAction || homeTheme.onHero,
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (item: Country) => {
    setSearch('');
    onSelect(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la sélection de pays"
          onPress={handleClose}
          style={styles.backdrop}
        />

        <View style={[styles.sheetCard, { backgroundColor: c.surface }]}>
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: c.border }]} />
          </View>

          <View style={styles.header}>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              Sélectionner un pays
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: c.background }]}
            >
              <X size={18} color={c.text} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={[styles.searchBox, { backgroundColor: c.background, borderColor: c.border }]}>
            <Search size={18} color={c.muted} style={styles.searchIcon} strokeWidth={1.8} />
            <TextInput
              placeholder="Rechercher un pays…"
              placeholderTextColor={c.muted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              style={[styles.searchInput, { color: c.text }]}
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Effacer la recherche"
                onPress={() => setSearch('')}
                style={styles.clearBtn}
              >
                <X size={16} color={c.muted} strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>

          {!search ? (
            <View style={styles.suggestionsSection}>
              <Text style={[styles.sectionTitle, { color: c.muted }]}>Suggestions rapides</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {POPULAR_COUNTRIES.map((item) => {
                  const isSelected =
                    (selectedCountry && selectedCountry.code === item.code) ||
                    (selectedCountryName && selectedCountryName.toLowerCase() === item.name.toLowerCase());
                  return (
                    <Pressable
                      key={item.code}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: isSelected ? c.action : c.background,
                          borderColor: isSelected ? c.action : c.border,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.chipFlag}>{item.flag}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? c.onAction : c.text },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.listHeaderRow}>
            <Text style={[styles.sectionTitle, { color: c.muted }]}>
              {search ? `${filtered.length} pays trouvé${filtered.length > 1 ? 's' : ''}` : 'Tous les pays'}
            </Text>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            initialNumToRender={20}
            maxToRenderPerBatch={25}
            windowSize={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: c.muted }]}>
                  Aucun pays ne correspond à votre recherche.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected =
                (selectedCountry && selectedCountry.code === item.code) ||
                (selectedCountryName && selectedCountryName.toLowerCase() === item.name.toLowerCase());

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  accessibilityState={{ selected: !!isSelected }}
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected && { backgroundColor: c.background },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.flagWrapper}>
                    <Text style={styles.flagEmoji}>{item.flag}</Text>
                  </View>
                  <Text
                    style={[
                      styles.countryName,
                      { color: c.text },
                      isSelected && { fontFamily: fonts.heading, color: c.action },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: c.action }]}>
                      <Check size={14} color={c.onAction} strokeWidth={2.5} />
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 26, 42, 0.55)',
  },
  sheetCard: {
    maxHeight: '85%',
    minHeight: '60%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  clearBtn: {
    padding: 6,
  },
  suggestionsSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipFlag: {
    fontSize: 16,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  listHeaderRow: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 50,
  },
  pressed: {
    opacity: 0.65,
  },
  flagWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },
  countryName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
