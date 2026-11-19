import { homeImages } from './home';

export type CommunityStatus = 'member' | 'pending' | 'discoverable';

export type CommunityMessage = {
  id: string;
  senderName: string;
  senderRole?: 'Admin' | 'Animateur' | 'Membre';
  avatarInitials: string;
  text: string;
  time: string;
  isMe?: boolean;
};

export type Community = {
  id: string;
  name: string;
  category: 'Prière' | 'Villes' | 'Jeunesse' | 'Méditation' | 'Famille';
  description: string;
  image: any;
  membersCount: number;
  adminName: string;
  readOnly: boolean;
  status: CommunityStatus;
  unreadCount: number;
  notificationsEnabled: boolean;
  messages: CommunityMessage[];
};

export const initialCommunities: Community[] = [
  {
    id: 'matin',
    name: 'Veilleurs du matin',
    category: 'Prière',
    description: 'Prière et intercession à l’aube chaque matin à 5h30. Partage de sujets de prière et communion fraternelle.',
    image: homeImages.community,
    membersCount: 142,
    adminName: 'Pasteur Selwyn',
    readOnly: false,
    status: 'member',
    unreadCount: 3,
    notificationsEnabled: true,
    messages: [
      {
        id: 'm1',
        senderName: 'Pasteur Selwyn',
        senderRole: 'Admin',
        avatarInitials: 'PS',
        text: 'Bonjour veilleurs ! Que la grâce du Seigneur repose sur chacun de vous en ce matin béni. 🙏 Rendons grâce pour le don de la vie.',
        time: '05:32',
      },
      {
        id: 'm2',
        senderName: 'Sœur Marie',
        senderRole: 'Membre',
        avatarInitials: 'SM',
        text: 'Amen pasteur ! Prions pour nos familles et pour le recueillement de nos cœurs tout au long de la journée.',
        time: '05:45',
      },
      {
        id: 'm3',
        senderName: 'Frère David',
        senderRole: 'Membre',
        avatarInitials: 'FD',
        text: 'Je rends grâce à Dieu pour une délivrance et une paix retrouvée cette semaine dans mon foyer ! Alléluia 🙌',
        time: '06:12',
      },
    ],
  },
  {
    id: 'partage',
    name: 'Prière et partage',
    category: 'Prière',
    description: 'Un espace officiel pour prier ensemble et recevoir les orientations et méditations du mouvement.',
    image: homeImages.prayer,
    membersCount: 380,
    adminName: 'Équipe pastorale',
    readOnly: true,
    status: 'member',
    unreadCount: 1,
    notificationsEnabled: true,
    messages: [
      {
        id: 'p1',
        senderName: 'Équipe pastorale',
        senderRole: 'Admin',
        avatarInitials: 'EP',
        text: 'Chers frères et sœurs, le sujet de prière du jour porte sur la persévérance dans l’épreuve (Jacques 1.2-4). Prenez 15 minutes ce midi pour vous recueillir dans sa présence.',
        time: '07:00',
      },
      {
        id: 'p2',
        senderName: 'Équipe pastorale',
        senderRole: 'Admin',
        avatarInitials: 'EP',
        text: 'Rappel : la grande veillée de prière aura lieu le 28 novembre à Douala. Venez avec des cœurs assoiffés de l’Esprit de Dieu ! 🔥',
        time: 'Hier, 19:30',
      },
    ],
  },
  {
    id: 'douala',
    name: 'Koinonia Douala Centre',
    category: 'Villes',
    description: 'Communauté locale des membres résidant à Douala. Organisation des rencontres physiques, agapes et veillées régionales.',
    image: homeImages.candle,
    membersCount: 215,
    adminName: 'Frère Philippe',
    readOnly: false,
    status: 'pending',
    unreadCount: 0,
    notificationsEnabled: false,
    messages: [
      {
        id: 'd1',
        senderName: 'Frère Philippe',
        senderRole: 'Admin',
        avatarInitials: 'FP',
        text: 'Bienvenue aux nouveaux membres de Douala ! Les informations pour la répétition de la chorale seront publiées vendredi.',
        time: '14 nov.',
      },
    ],
  },
  {
    id: 'jeunes',
    name: 'Jeunesse en Feu',
    category: 'Jeunesse',
    description: 'Étudiants et jeunes professionnels engagés à vivre leur foi avec audace et intégrité dans leur génération.',
    image: homeImages.rest,
    membersCount: 95,
    adminName: 'Frère Samuel',
    readOnly: false,
    status: 'discoverable',
    unreadCount: 0,
    notificationsEnabled: false,
    messages: [
      {
        id: 'j1',
        senderName: 'Frère Samuel',
        senderRole: 'Admin',
        avatarInitials: 'FS',
        text: 'Salut à toute l’équipe ! Rendez-vous ce samedi pour notre étude biblique sur le leadership chrétien.',
        time: '12 nov.',
      },
    ],
  },
  {
    id: 'meditation',
    name: 'Cercle de Méditation Biblique',
    category: 'Méditation',
    description: 'Étude approfondie des Écritures et partage régulier autour des enseignements des Breakfasts quotidiens.',
    image: homeImages.bible,
    membersCount: 180,
    adminName: 'Dr. Emmanuel',
    readOnly: false,
    status: 'discoverable',
    unreadCount: 0,
    notificationsEnabled: false,
    messages: [
      {
        id: 'c1',
        senderName: 'Dr. Emmanuel',
        senderRole: 'Admin',
        avatarInitials: 'DE',
        text: 'Bienvenue aux amoureux de la Parole ! Aujourd’hui, méditons sur la parabole du semeur (Marc 4).',
        time: '10 nov.',
      },
    ],
  },
  {
    id: 'famille',
    name: 'Couples et Foyers Chrétiens',
    category: 'Famille',
    description: 'Édification mutuelle pour les foyers, conseils bibliques pour l’éducation des enfants et prière pour les couples.',
    image: homeImages.dawn,
    membersCount: 64,
    adminName: 'Pasteur & Mme Selwyn',
    readOnly: true,
    status: 'discoverable',
    unreadCount: 0,
    notificationsEnabled: false,
    messages: [
      {
        id: 'f1',
        senderName: 'Pasteur & Mme Selwyn',
        senderRole: 'Admin',
        avatarInitials: 'PS',
        text: 'Que la paix du Christ règne dans vos maisons. Retrouvez ce soir la méditation spéciale sur le pardon au sein du couple.',
        time: '08 nov.',
      },
    ],
  },
];
