# Koinonia Mobile App 🕊️

Application mobile spirituelle et communautaire développée avec **React Native**, **Expo**, **TypeScript** et **NativeWind (Tailwind CSS)**.

## 📱 Fonctionnalités principales

- **Accueil & Méditation quotidienne :** Hero quotidien avec lecteur audio/vidéo et mode lecture, verset du jour, accès rapide aux méditations récentes et événements.
- **Breakfasts du matin :** Découverte de messages inspirants, filtres par thématiques/formats (vidéo/texte), recherche instantanée intégrée, lecture immersive avec citation biblique.
- **Groupes & Communautés :** Espaces d'échange et d'intercession chrétienne, discussions, filtres par catégories et participation active.
- **La Bible (Louis Segond 1910) :**
  - Navigation intuitive entre l'Ancien et le Nouveau Testament.
  - Sélection rapide des livres et chapitres.
  - Mise en page soignée, responsive et lisible avec numérotation des versets.
  - Actions rapides au toucher (copier, partager, surligner).
- **Menu contextuel de notifications :** Dropdown flottant interactif avec distinction par catégories (Breakfasts, Groupes, Versets, Événements), statut de lecture, action « Tout lire » et navigation contextuelle directe.
- **Réglages & Personnalisation :**
  - Gestion du profil utilisateur.
  - Paramètres de taille de police de lecture biblique (15px, 17px, 19px, 22px) avec prévisualisation en direct.
  - Préférences de notifications push.
  - Synchronisation hors-ligne et sécurité de compte.
- **Onboarding soigné :** Parcours d'accueil fluide avec sélection internationale de l'indicatif téléphonique (`react-native-international-phone-number`), sélection de pays et complétion du profil.

---

## 🎨 Charte graphique & Design System

L'application repose sur la palette de couleurs spirituelle et apaisante de Koinonia :
- **Canvas / Fond :** `#F7F5F0` (ivoire doux)
- **Surfaces :** `#FFFFFF`
- **Action principale :** `#006B65` (vert émeraude / teal profond)
- **Menthe douce :** `#DBECE9`
- **Accents chauds :** `#E9B872` (ambre)
- **Typographie :** Montserrat & Poppins

---

## 🚀 Installation et Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Application mobile **Expo Go** (iOS / Android) ou émulateur configuré

### Installation
```bash
# Se placer dans le répertoire du projet
cd koinonia-app

# Installer les dépendances
npm install
```

### Configuration des variables d'environnement
Copiez le fichier exemple `.env.example` en `.env.local` et adaptez les valeurs si nécessaire :
```bash
cp .env.example .env.local
```

### Démarrage du serveur de développement
```bash
npx expo start
```
Scannez le QR code généré avec l'application Expo Go ou lancez sur émulateur (`a` pour Android, `i` pour iOS, `w` pour Web).

### Vérification des types TypeScript
```bash
npm run typecheck
```

---

## 📂 Structure du projet

```text
koinonia-app/
├── assets/             # Images, icônes et polices locales
├── components/         # Écrans et composants modulaires
│   ├── AuthScreen.tsx
│   ├── BibleScreen.tsx
│   ├── BreakfastsScreen.tsx
│   ├── GroupsScreen.tsx
│   ├── HomeScreen.tsx
│   ├── NotificationsMenu.tsx
│   ├── OnboardingScreen.tsx
│   ├── SettingsScreen.tsx
│   └── ...
├── data/               # Données statiques et modèles (bible, breakfasts, groups, notifications)
├── lib/                # Utilitaires et clients d'authentification
├── app.json            # Configuration Expo
├── package.json        # Dépendances et scripts
└── tsconfig.json       # Configuration TypeScript
```

---

## 📄 Licence

Ce projet est sous licence MIT.
