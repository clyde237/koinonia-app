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
import { controls, fonts, homeTheme as c } from '../lib/theme';

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
          strokeWidth={controls.iconStroke}
        />
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        selectionColor={c.action}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never" // On gère le bouton clear personnalisé pour cohérence multi-plateforme
        accessibilityLabel={placeholder}
        style={s.input}
      />

      {value.trim().length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          onPress={handleClear}
          style={({ pressed }) => [s.clearButton, pressed && s.pressed]}
        >
          <View style={s.clearCircle}>
            <X size={15} color={c.action} strokeWidth={controls.iconStroke} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 25,
    paddingLeft: 14,
    paddingRight: 1,
    borderWidth: 2,
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
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: controls.touchSize,
    fontFamily: fonts.body,
    fontSize: 15,
    color: c.text,
    paddingVertical: 8,
    paddingRight: 12,
  },
  clearButton: {
    width: controls.touchSize,
    height: controls.touchSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: c.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: controls.pressedOpacity,
  },
});
