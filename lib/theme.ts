/** Tokens de l’accueil clair, issus de design/DESIGN_SYSTEM_KOINONIA.md. */
export const homeTheme = {
  canvas: '#F7F5F0',
  surface: '#FFFFFF',
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
} as const;

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
