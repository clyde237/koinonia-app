/** @jsxImportSource react */
import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { fonts, homeTheme as c } from '../lib/theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  placeholder = 'Rechercher un Breakfast, un passage, un thème…',
  autoFocus = false,
  style,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View
      accessibilityRole="search"
      style={[
        s.container,
        focused ? s.containerFocused : s.containerNormal,
        style,
      ]}
    >
      <View style={s.iconWrapper} pointerEvents="none">
        <Search
          size={19}
          color={focused ? c.action : c.muted}
          strokeWidth={focused ? 2 : 1.75}
        />
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#8C9CAE"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never" // On gère le bouton clear personnalisé pour cohérence multi-plateforme
        accessibilityLabel="Barre de recherche des Breakfasts"
        style={s.input}
      />

      {value.trim().length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          onPress={handleClear}
          hitSlop={8}
          style={({ pressed }) => [s.clearButton, pressed && s.pressed]}
        >
          <View style={s.clearCircle}>
            <X size={14} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 25,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  containerNormal: {
    borderColor: c.divider,
    shadowColor: '#111A2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  containerFocused: {
    borderColor: c.action,
    shadowColor: c.action,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: 15,
    color: c.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8C9CAE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
});
