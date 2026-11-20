/** Tokens de design Koinonia (clair et sombre nuit étoilée / clair de lune). */

export type ThemeColors = {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  muted: string;
  divider: string;
  action: string;
  brand: string;
  mint: string;
  amber: string;
  amberSurface: string;
  amberText: string;
  onHero: string;
  onHeroAction: string;
  critical: string;
  onCritical: string;
  moonlightBorder: string;
  moonlightGlow: string;
  cardShadow: string;
  inputBg: string;
  badgeBg: string;
  badgeText: string;
  navGlass: string;
  navBorder: string;
};

export const lightTheme: ThemeColors = {
  canvas: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  text: '#2A364E',
  muted: '#536478',
  divider: '#DAE4E3',
  action: '#006B65',
  brand: '#00A99D',
  mint: '#DBECE9',
  amber: '#E9B872',
  amberSurface: '#F7E9D3',
  amberText: '#6B4823',
  onHero: '#FFFFFF',
  onHeroAction: '#0B2929',
  critical: '#B42318',
  onCritical: '#FFFFFF',
  moonlightBorder: '#F0ECE5',
  moonlightGlow: 'rgba(0, 169, 157, 0.08)',
  cardShadow: '#504330',
  inputBg: '#FFFFFF',
  badgeBg: '#DBECE9',
  badgeText: '#006B65',
  navGlass: 'rgba(255, 255, 255, 0.92)',
  navBorder: '#FFFFFF',
};

/**
 * Thème Nuit Koinonia : Bleu nuit profond inspiré du clair de lune.
 * Subtil, apaisant, avec des accents turquoise lunaires luminescents.
 */
export const darkTheme: ThemeColors = {
  canvas: '#0B1320',          // Bleu nuit profond et apaisant
  surface: '#131F33',         // Cartes et panneaux bleu nuit surélevés
  surfaceRaised: '#1C2C46',   // Modales et composants au premier plan
  text: '#F5F7FA',            // Texte blanc perle doux
  muted: '#96A9C0',           // Texte secondaire bleu ardoise lunaire
  divider: '#20324B',         // Lignes de séparation bleu nuit discret
  action: '#4EEAD8',          // Turquoise clair luminescent clair de lune
  brand: '#00A99D',           // Marque turquoise
  mint: '#183C45',            // Pastilles et cercles actifs bleu-vert nuit
  amber: '#F3C77D',           // Accent doré étoilé
  amberSurface: '#24344A',    // Fond ambre discret en mode sombre
  amberText: '#F7CA73',       // Texte ambre doux
  onHero: '#FFFFFF',
  onHeroAction: '#071F22',
  critical: '#FCA5A5',
  onCritical: '#1B293D',
  moonlightBorder: '#233956', // Bordure fine effet lueur de lune
  moonlightGlow: 'rgba(78, 234, 216, 0.16)', // Halo subtil de lune
  cardShadow: '#050910',
  inputBg: '#182740',
  badgeBg: '#183C45',
  badgeText: '#4EEAD8',
  navGlass: 'rgba(19, 31, 51, 0.92)', // Flou verre bleu nuit
  navBorder: '#28425F',
};

/** Alias pour rétrocompatibilité avec les imports existants */
export const homeTheme = lightTheme;

export const fonts = {
  heading: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  body: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
} as const;

export const controls = {
  touchSize: 48,
  iconStroke: 1.75,
  pressedOpacity: 0.82,
  photoOutline: 'rgba(0,0,0,0.1)',
} as const;
