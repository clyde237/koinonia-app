export interface Country {
  name: string;        // Nom en français (ex. "Cameroun", "France")
  code: string;        // Code ISO à 2 lettres (ex. "CM", "FR")
  dialCode: string;    // Indicatif international (ex. "+237", "+33")
  flag: string;        // Emoji drapeau (ex. "🇨🇲", "🇫🇷")
}

export const COUNTRIES: Country[] = [
  // Afrique francophone et priorité
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Côte d’Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'CD', name: 'Rép. Dém. du Congo', dialCode: '+243', flag: '🇨🇩' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'TD', name: 'Tchad', dialCode: '+235', flag: '🇹🇩' },
  { code: 'CF', name: 'Centrafrique', dialCode: '+236', flag: '🇨🇫' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
  { code: 'GQ', name: 'Guinée équatoriale', dialCode: '+240', flag: '🇬🇶' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸' },
  { code: 'HT', name: 'Haïti', dialCode: '+509', flag: '🇭🇹' },
  { code: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮' },
  { code: 'KM', name: 'Comores', dialCode: '+269', flag: '🇰🇲' },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯' },
  { code: 'SC', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨' },
  { code: 'MU', name: 'Maurice', dialCode: '+230', flag: '🇲🇺' },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
  { code: 'MR', name: 'Mauritanie', dialCode: '+222', flag: '🇲🇷' },
  { code: 'NG', name: 'Nigéria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', flag: '🇿🇦' },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴' },
  { code: 'ET', name: 'Éthiopie', dialCode: '+251', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzanie', dialCode: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Ouganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'ZM', name: 'Zambie', dialCode: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿' },
  { code: 'NA', name: 'Namibie', dialCode: '+264', flag: '🇳🇦' },
  { code: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼' },
  { code: 'CV', name: 'Cap-Vert', dialCode: '+238', flag: '🇨🇻' },
  { code: 'GW', name: 'Guinée-Bissau', dialCode: '+245', flag: '🇬🇼' },
  { code: 'LR', name: 'Libéria', dialCode: '+231', flag: '🇱🇷' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', dialCode: '+239', flag: '🇸🇹' },
  { code: 'SS', name: 'Soudan du Sud', dialCode: '+211', flag: '🇸🇸' },
  { code: 'SD', name: 'Soudan', dialCode: '+249', flag: '🇸🇩' },
  { code: 'SO', name: 'Somalie', dialCode: '+252', flag: '🇸🇴' },
  { code: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼' },
  { code: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸' },
  { code: 'SZ', name: 'Eswatini', dialCode: '+268', flag: '🇸🇿' },
  { code: 'ER', name: 'Érythrée', dialCode: '+291', flag: '🇪🇷' },
  { code: 'GM', name: 'Gambie', dialCode: '+220', flag: '🇬🇲' },

  // Europe
  { code: 'DE', name: 'Allemagne', dialCode: '+49', flag: '🇩🇪' },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
  { code: 'IT', name: 'Italie', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Espagne', dialCode: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'NL', name: 'Pays-Bas', dialCode: '+31', flag: '🇳🇱' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺' },
  { code: 'IE', name: 'Irlande', dialCode: '+353', flag: '🇮🇪' },
  { code: 'SE', name: 'Suède', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norvège', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Danemark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlande', dialCode: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Pologne', dialCode: '+48', flag: '🇵🇱' },
  { code: 'AT', name: 'Autriche', dialCode: '+43', flag: '🇦🇹' },
  { code: 'GR', name: 'Grèce', dialCode: '+30', flag: '🇬🇷' },
  { code: 'RO', name: 'Roumanie', dialCode: '+40', flag: '🇷🇴' },
  { code: 'HU', name: 'Hongrie', dialCode: '+36', flag: '🇭🇺' },
  { code: 'CZ', name: 'République tchèque', dialCode: '+420', flag: '🇨🇿' },
  { code: 'SK', name: 'Slovaquie', dialCode: '+421', flag: '🇸🇰' },
  { code: 'BG', name: 'Bulgarie', dialCode: '+359', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatie', dialCode: '+385', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovénie', dialCode: '+386', flag: '🇸🇮' },
  { code: 'EE', name: 'Estonie', dialCode: '+372', flag: '🇪🇪' },
  { code: 'LV', name: 'Lettonie', dialCode: '+371', flag: '🇱🇻' },
  { code: 'LT', name: 'Lituanie', dialCode: '+370', flag: '🇱🇹' },
  { code: 'CY', name: 'Chypre', dialCode: '+357', flag: '🇨🇾' },
  { code: 'MT', name: 'Malte', dialCode: '+356', flag: '🇲🇹' },
  { code: 'IS', name: 'Islande', dialCode: '+354', flag: '🇮🇸' },
  { code: 'AL', name: 'Albanie', dialCode: '+355', flag: '🇦🇱' },
  { code: 'AD', name: 'Andorre', dialCode: '+376', flag: '🇦🇩' },
  { code: 'AM', name: 'Arménie', dialCode: '+374', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaïdjan', dialCode: '+994', flag: '🇦🇿' },
  { code: 'BY', name: 'Biélorussie', dialCode: '+375', flag: '🇧🇾' },
  { code: 'BA', name: 'Bosnie-Herzégovine', dialCode: '+387', flag: '🇧🇦' },
  { code: 'GE', name: 'Géorgie', dialCode: '+995', flag: '🇬🇪' },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423', flag: '🇱🇮' },
  { code: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨' },
  { code: 'MD', name: 'Moldavie', dialCode: '+373', flag: '🇲🇩' },
  { code: 'ME', name: 'Monténégro', dialCode: '+382', flag: '🇲🇪' },
  { code: 'MK', name: 'Macédoine du Nord', dialCode: '+389', flag: '🇲🇰' },
  { code: 'RS', name: 'Serbie', dialCode: '+381', flag: '🇷🇸' },
  { code: 'SM', name: 'Saint-Marin', dialCode: '+378', flag: '🇸🇲' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦' },
  { code: 'VA', name: 'Vatican', dialCode: '+379', flag: '🇻🇦' },
  { code: 'RU', name: 'Russie', dialCode: '+7', flag: '🇷🇺' },

  // Amériques
  { code: 'BR', name: 'Brésil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexique', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentine', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombie', dialCode: '+57', flag: '🇨🇴' },
  { code: 'CL', name: 'Chili', dialCode: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Pérou', dialCode: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Équateur', dialCode: '+593', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivie', dialCode: '+591', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'GY', name: 'Guyana', dialCode: '+592', flag: '🇬🇾' },
  { code: 'SR', name: 'Suriname', dialCode: '+597', flag: '🇸🇷' },
  { code: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'SV', name: 'Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
  { code: 'DO', name: 'République dominicaine', dialCode: '+1', flag: '🇩🇴' },
  { code: 'JM', name: 'Jamaïque', dialCode: '+1', flag: '🇯🇲' },
  { code: 'TT', name: 'Trinité-et-Tobago', dialCode: '+1', flag: '🇹🇹' },
  { code: 'BS', name: 'Bahamas', dialCode: '+1', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbade', dialCode: '+1', flag: '🇧🇧' },
  { code: 'LC', name: 'Sainte-Lucie', dialCode: '+1', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint-Vincent-et-les-Grenadines', dialCode: '+1', flag: '🇻🇨' },
  { code: 'GD', name: 'Grenade', dialCode: '+1', flag: '🇬🇩' },
  { code: 'AG', name: 'Antigua-et-Barbuda', dialCode: '+1', flag: '🇦🇬' },
  { code: 'DM', name: 'Dominique', dialCode: '+1', flag: '🇩🇲' },
  { code: 'KN', name: 'Saint-Christophe-et-Niévès', dialCode: '+1', flag: '🇰🇳' },
  { code: 'GP', name: 'Guadeloupe', dialCode: '+590', flag: '🇬🇵' },
  { code: 'MQ', name: 'Martinique', dialCode: '+596', flag: '🇲🇶' },
  { code: 'GF', name: 'Guyane française', dialCode: '+594', flag: '🇬🇫' },
  { code: 'RE', name: 'La Réunion', dialCode: '+262', flag: '🇷🇪' },
  { code: 'YT', name: 'Mayotte', dialCode: '+262', flag: '🇾🇹' },
  { code: 'NC', name: 'Nouvelle-Calédonie', dialCode: '+687', flag: '🇳🇨' },
  { code: 'PF', name: 'Polynésie française', dialCode: '+689', flag: '🇵🇫' },

  // Moyen-Orient et Asie
  { code: 'TR', name: 'Turquie', dialCode: '+90', flag: '🇹🇷' },
  { code: 'EG', name: 'Égypte', dialCode: '+20', flag: '🇪🇬' },
  { code: 'SA', name: 'Arabie saoudite', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'Émirats arabes unis', dialCode: '+971', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Koweït', dialCode: '+965', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahreïn', dialCode: '+973', flag: '🇧🇭' },
  { code: 'IL', name: 'Israël', dialCode: '+972', flag: '🇮🇱' },
  { code: 'JO', name: 'Jordanie', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Liban', dialCode: '+961', flag: '🇱🇧' },
  { code: 'IQ', name: 'Irak', dialCode: '+964', flag: '🇮🇶' },
  { code: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷' },
  { code: 'SY', name: 'Syrie', dialCode: '+963', flag: '🇸🇾' },
  { code: 'YE', name: 'Yémen', dialCode: '+967', flag: '🇾🇪' },
  { code: 'CN', name: 'Chine', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'Inde', dialCode: '+91', flag: '🇮🇳' },
  { code: 'JP', name: 'Japon', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'Corée du Sud', dialCode: '+82', flag: '🇰🇷' },
  { code: 'ID', name: 'Indonésie', dialCode: '+62', flag: '🇮🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Viêt Nam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'TH', name: 'Thaïlande', dialCode: '+66', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaisie', dialCode: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapour', dialCode: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taïwan', dialCode: '+886', flag: '🇹🇼' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Népal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'MM', name: 'Birmanie (Myanmar)', dialCode: '+95', flag: '🇲🇲' },
  { code: 'KH', name: 'Cambodge', dialCode: '+855', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦' },
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿' },
  { code: 'UZ', name: 'Ouzbékistan', dialCode: '+998', flag: '🇺🇿' },
  { code: 'TM', name: 'Turkménistan', dialCode: '+993', flag: '🇹🇲' },
  { code: 'KG', name: 'Kirghizistan', dialCode: '+996', flag: '🇰🇬' },
  { code: 'TJ', name: 'Tadjikistan', dialCode: '+992', flag: '🇹🇯' },
  { code: 'MN', name: 'Mongolie', dialCode: '+976', flag: '🇲🇳' },
  { code: 'BT', name: 'Bhoutan', dialCode: '+975', flag: '🇧🇹' },
  { code: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻' },
  { code: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳' },
  { code: 'TL', name: 'Timor oriental', dialCode: '+670', flag: '🇹🇱' },

  // Océanie
  { code: 'AU', name: 'Australie', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nouvelle-Zélande', dialCode: '+64', flag: '🇳🇿' },
  { code: 'PG', name: 'Papouasie-Nouvelle-Guinée', dialCode: '+675', flag: '🇵🇬' },
  { code: 'FJ', name: 'Fidji', dialCode: '+679', flag: '🇫🇯' },
  { code: 'SB', name: 'Îles Salomon', dialCode: '+677', flag: '🇸🇧' },
  { code: 'VU', name: 'Vanuatu', dialCode: '+678', flag: '🇻🇺' },
  { code: 'WS', name: 'Samoa', dialCode: '+685', flag: '🇼🇸' },
  { code: 'TO', name: 'Tonga', dialCode: '+676', flag: '🇹🇴' },
  { code: 'FM', name: 'Micronésie', dialCode: '+691', flag: '🇫🇲' },
  { code: 'KI', name: 'Kiribati', dialCode: '+686', flag: '🇰🇮' },
  { code: 'MH', name: 'Îles Marshall', dialCode: '+692', flag: '🇲🇭' },
  { code: 'PW', name: 'Palaos', dialCode: '+680', flag: '🇵🇼' },
  { code: 'NR', name: 'Nauru', dialCode: '+674', flag: '🇳🇷' },
  { code: 'TV', name: 'Tuvalu', dialCode: '+688', flag: '🇹🇻' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]; // Cameroun (+237, 🇨🇲)

export const POPULAR_COUNTRIES: Country[] = COUNTRIES.slice(0, 10);

/** Normalise une chaîne de texte pour recherche insensible aux accents, apostrophes et casse. */
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019']/g, "'")
    .toLowerCase()
    .trim();
}

/** Recherche dans la liste des pays par nom, indicatif ou code ISO. */
export function searchCountries(query: string): Country[] {
  if (!query) return COUNTRIES;
  const q = normalizeText(query);
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(c =>
    normalizeText(c.name).includes(q) ||
    c.dialCode.includes(q) ||
    c.code.toLowerCase().includes(q)
  );
}

/** Trouve un pays par son nom en français (insensible à la casse et aux accents). */
export function findCountryByName(name: string): Country | undefined {
  if (!name) return undefined;
  const norm = normalizeText(name);
  return COUNTRIES.find(c => normalizeText(c.name) === norm);
}

/** Trouve un pays par son indicatif téléphonique international. */
export function findCountryByDialCode(dialCode: string): Country | undefined {
  if (!dialCode) return undefined;
  const clean = dialCode.trim();
  return COUNTRIES.find(c => c.dialCode === clean);
}

/** Trouve un pays par son code ISO à deux lettres. */
export function findCountryByCode(code: string): Country | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase();
  return COUNTRIES.find(c => c.code === clean);
}
