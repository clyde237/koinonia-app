import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import LibPhoneInput, {
  ICountry,
  getCountryByCca2,
} from 'react-native-international-phone-number';
import { ChevronDown, Smartphone } from 'lucide-react-native';
import { fonts, homeTheme } from '../lib/theme';
import { Country, DEFAULT_COUNTRY, findCountryByCode } from '../data/countries';

export interface PhoneInputProps {
  value: string;
  onChangeText: (phone: string) => void;
  selectedDialCode?: string;
  onSelectDialCode?: (country: Country) => void;
  selectedCountry?: Country;
  onSelectCountry?: (country: Country) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  editable?: boolean;
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

export function PhoneInput({
  value,
  onChangeText,
  selectedCountry,
  onSelectCountry,
  onSelectDialCode,
  label = 'Téléphone',
  placeholder = '6 00 00 00 00',
  disabled = false,
  editable = true,
  colors,
}: PhoneInputProps) {
  const isDisabled = disabled || !editable;

  const c = {
    background: colors?.background || homeTheme.canvas,
    surface: colors?.surface || homeTheme.surface,
    text: colors?.text || homeTheme.text,
    muted: colors?.muted || homeTheme.muted,
    border: colors?.border || homeTheme.divider,
    action: colors?.action || homeTheme.action,
    onAction: colors?.onAction || homeTheme.onHero,
  };

  const libSelectedCountry: ICountry | undefined = useMemo(() => {
    const code = selectedCountry?.code || DEFAULT_COUNTRY.code;
    return getCountryByCca2(code);
  }, [selectedCountry?.code]);

  const handleCountryChange = (country: ICountry) => {
    const existing = findCountryByCode(country.cca2);
    const mapped: Country = existing || {
      code: country.cca2,
      name: country.translations?.fra?.common || country.name?.common || country.cca2,
      dialCode: country.idd?.root || '+237',
      flag: country.flag,
    };
    onSelectCountry?.(mapped);
    onSelectDialCode?.(mapped);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: c.text }]}>{label}</Text> : null}

      <View
        style={[
          styles.outerBox,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
          },
          isDisabled && styles.disabled,
        ]}
      >
        <View style={styles.inputFlex}>
          <LibPhoneInput
            value={value}
            onChangePhoneNumber={onChangeText}
            selectedCountry={libSelectedCountry}
            onChangeSelectedCountry={handleCountryChange}
            defaultCountry={(selectedCountry?.code as any) || 'CM'}
            language="fra"
            placeholder={placeholder}
            phoneInputPlaceholderTextColor={c.muted}
            disabled={isDisabled}
            modalType="bottomSheet"
            popularCountries={['CM', 'CI', 'FR', 'CD', 'GA', 'SN', 'BE', 'CH', 'CA', 'CG']}
            modalPopularCountriesTitle="Pays fréquents"
            modalAllCountriesTitle="Tous les pays"
            modalSearchInputPlaceholder="Rechercher un pays ou indicatif…"
            modalNotFoundCountryMessage="Aucun pays trouvé"
            customCaret={() => (
              <ChevronDown
                size={14}
                color={c.text}
                strokeWidth={2}
                style={styles.caretIcon}
              />
            )}
            customFlag={(item) => (
              <View style={styles.flagBadge}>
                <Text style={styles.flagText}>{item.flag}</Text>
              </View>
            )}
            phoneInputStyles={{
              container: styles.libContainer,
              flagContainer: [
                styles.libFlagContainer,
                { backgroundColor: c.background === '#111A2A' ? '#23334A' : '#F0F2F5' },
              ],
              flag: styles.libFlag,
              caret: styles.libCaret,
              divider: styles.libDivider,
              callingCode: [styles.libCallingCode, { color: c.text }],
              input: [styles.libInput, { color: c.text }],
            }}
            modalStyles={{
              backdrop: {
                backgroundColor: 'rgba(17, 26, 42, 0.55)',
              },
              content: {
                backgroundColor: c.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingBottom: Platform.OS === 'ios' ? 24 : 16,
              },
              dragHandleIndicator: {
                backgroundColor: c.border,
                width: 38,
                height: 4,
                borderRadius: 2,
              },
              searchContainer: {
                backgroundColor: c.background,
                borderColor: c.border,
                borderWidth: 1,
                borderRadius: 14,
                marginHorizontal: 16,
                marginVertical: 10,
                paddingHorizontal: 12,
                minHeight: 46,
              },
              searchInput: {
                fontFamily: fonts.body,
                color: c.text,
                fontSize: 15,
              },
              countryItem: {
                borderBottomColor: c.border,
                paddingVertical: 13,
                paddingHorizontal: 16,
              },
              countryName: {
                fontFamily: fonts.body,
                color: c.text,
                fontSize: 15,
              },
              callingCode: {
                fontFamily: fonts.heading,
                color: c.action,
                fontSize: 14,
                marginRight: 10,
              },
              sectionTitle: {
                fontFamily: fonts.heading,
                color: c.muted,
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 4,
              },
            }}
          />
        </View>

        <View style={styles.phoneIconBox} pointerEvents="none">
          <Smartphone size={18} color={c.muted} strokeWidth={1.5} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  outerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 54,
    paddingLeft: 4,
    paddingRight: 14,
  },
  inputFlex: {
    flex: 1,
  },
  phoneIconBox: {
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  flagBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  flagText: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  caretIcon: {
    marginLeft: 2,
    marginRight: 6,
  },
  libContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    minHeight: 52,
    paddingHorizontal: 4,
    alignItems: 'center',
    width: '100%',
  },
  libFlagContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libFlag: {
    marginRight: 0,
  },
  libCaret: {
    display: 'none',
  },
  libDivider: {
    display: 'none',
  },
  libCallingCode: {
    fontFamily: fonts.heading,
    fontSize: 14,
    marginLeft: 4,
    marginRight: 4,
  },
  libInput: {
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    flex: 1,
  },
});
