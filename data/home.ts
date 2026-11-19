/** Contenus de démonstration du frontend. Aucune publication ou adhésion réelle. */
export const homeImages = {
  dawn: require('../assets/home/dawn-mountains.jpg'),
  rest: require('../assets/home/quiet-morning.jpg'),
  bible: require('../assets/home/open-bible.jpg'),
  community: require('../assets/home/community.jpg'),
  prayer: require('../assets/home/prayer-hands.jpg'),
  candle: require('../assets/home/candle.jpg'),
};

export const dailyBreakfast = {
  id: 'peace',
  title: 'La paix au milieu du bruit',
  duration: '8 min de lecture',
  image: homeImages.dawn,
  format: 'video' as const,
  text: 'Au milieu des sollicitations et du bruit, prenons un instant pour nous tourner vers Dieu. La paix commence parfois par une simple pause : respirer, écouter et lui confier ce qui nous préoccupe.\n\nAujourd’hui, gardons un moment de silence pour accueillir sa présence. La journée n’a pas besoin d’être parfaite pour devenir un lieu de communion avec lui.',
};

export const recentBreakfasts = [
  { id: 'rest', title: 'Le repos en Dieu', duration: '6 min', image: homeImages.rest, format: 'video' as const, text: 'Prendre du repos, c’est aussi apprendre à faire confiance. Confions à Dieu ce que nous ne pouvons pas porter seuls et accueillons ce temps de paix.' },
  { id: 'faith', title: 'Marcher dans la foi', duration: '5 min', image: homeImages.bible, format: 'text' as const, text: 'La foi se vit un pas après l’autre. Nous ne connaissons pas toujours le chemin entier, mais nous pouvons choisir aujourd’hui un geste de confiance, de bonté et de fidélité.' },
  { id: 'morning', title: 'Un nouveau matin', duration: '4 min', image: homeImages.dawn, format: 'text' as const, text: 'Chaque matin nous invite à recommencer. Prenons le temps de remercier Dieu pour une chose simple et de lui confier la journée qui s’ouvre.' },
];

export type Breakfast = (typeof recentBreakfasts)[number] | typeof dailyBreakfast;

export const homeCommunities = [
  { id: 'matin', name: 'Veilleurs du matin', description: 'Prière et méditation au quotidien.', image: homeImages.community, readOnly: false },
  { id: 'partage', name: 'Prière et partage', description: 'Un espace pour prier ensemble.', image: homeImages.prayer, readOnly: true },
];
