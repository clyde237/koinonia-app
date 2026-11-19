import type { BiblePassage } from './bible';

export type NotificationCategory = 'breakfast' | 'community' | 'bible' | 'event';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  targetScreen?: 'home' | 'breakfasts' | 'groups' | 'bible' | 'settings';
  targetId?: string;
  biblePassage?: BiblePassage;
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'breakfast',
    title: 'Breakfast quotidien disponible',
    message: '« La paix au milieu du bruit » — Jean 15.4-5 est en ligne pour votre dévotion.',
    time: 'Aujourd’hui, 05:00',
    read: false,
    targetScreen: 'breakfasts',
  },
  {
    id: 'notif-2',
    category: 'community',
    title: 'Groupe Prière & Intercession',
    message: 'Frère Marc a partagé un sujet d’action de grâce pour sa famille.',
    time: 'Il y a 2h',
    read: false,
    targetScreen: 'groups',
  },
  {
    id: 'notif-3',
    category: 'bible',
    title: 'Verset du jour',
    message: '« Je suis le cep, vous êtes les sarments. » — Jean 15.5',
    time: 'Il y a 4h',
    read: false,
    targetScreen: 'bible',
    biblePassage: { bookId: 'jean', chapter: 15, verse: 5 },
  },
  {
    id: 'notif-4',
    category: 'event',
    title: 'Veillée d’intercession',
    message: 'Rappel : Veillée fraternelle à Douala le 28 novembre prochain.',
    time: 'Hier',
    read: true,
    targetScreen: 'home',
  },
];
