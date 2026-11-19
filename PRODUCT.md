# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

- **Membres du mouvement chrétien et nouveaux inscrits.** Ils suivent les enseignements du mouvement, consultent la Bible et participent à des communautés de prière. L’ouverture au-delà du mouvement reste à confirmer.
- **Administrateurs de communauté.** Ils traitent les demandes d’adhésion, animent les échanges et déterminent qui peut publier dans leur groupe.

## Product Purpose

Koinonia accompagne la vie spirituelle des membres du mouvement. Le lancement donne la priorité aux **Breakfasts**, les méditations et enseignements quotidiens du mouvement, et aux communautés de prière. La Bible et les fiches d’événement font aussi partie du MVP.

Le parcours de référence permet à un membre de créer son compte, d’accéder au Breakfast du jour depuis **Accueil**, de retrouver une publication ancienne et de demander à rejoindre une communauté.

## Positioning

Koinonia rassemble les enseignements du mouvement et ses propres communautés de prière. Un membre peut prolonger un Breakfast par la lecture du passage biblique ou par un échange dans une communauté. Les versions écrite et vidéo sont des publications distinctes que l’équipe peut programmer à la même heure.

## Operating Context

- **Application native iOS et Android.** Le code React Native et Expo partage les parcours sur les deux plateformes et s’appuie sur leurs réglages d’accessibilité, autorisations et fonctions de partage. L’espace web de gestion du mouvement relève du cadrage global dans `../PRODUCT.md`.
- **Compte et intégration.** L’inscription demande un nom d’affichage, un e-mail et un mot de passe. Le membre peut compléter les champs de profil et choisir ses centres d’intérêt, son historique affiché et ses notifications. Il peut modifier ses préférences ensuite. L’intégration se termine sur **Accueil**.
- **Consultation des Breakfasts.** L’historique choisi limite la liste affichée. La recherche couvre toutes les publications. Le membre lit la méditation écrite ou regarde la vidéo dans l’application. Il peut télécharger le texte accompagné de son image en PDF, ou la vidéo comme fichier sur son appareil.
- **Participation aux communautés.** Le membre peut demander plusieurs adhésions et suivre l’état de chacune. L’administrateur peut accepter ou refuser une demande et donner un motif. Les conversations prennent en charge le texte et les émojis. En lecture seule, tous les membres peuvent lire et seuls les administrateurs peuvent écrire.

## Capabilities and Constraints

- **Lecture et événements.** Le MVP prévoit la Bible Louis Segond 1910 par livre et chapitre, une taille de texte réglable et des événements informatifs. L’équipe peut mettre un événement à la une.
- **Notifications.** Prévoir des alertes pour les nouveaux Breakfasts et les nouveaux messages, avec un réglage par communauté. Le choix du service de notifications reste ouvert.
- **Profil et confidentialité.** Expliquer l’utilité des champs facultatifs et contrôler l’accès aux données déclarées, notamment l’église ou l’assemblée. L’identité et les sessions reposent sur Better Auth géré par Neon. Le profil est enregistré par l’API Koinonia. Le stockage des avatars est local à l’API en développement. Cloudflare R2 est prévu pour les fichiers.
- **Après le MVP.** Les inscriptions aux événements, les médias dans les conversations, les cantiques, la bibliothèque, la boutique et l’assistant IA sont reportés.

## Brand Commitments

Le nom du produit est **Koinonia**. La signature est **« Communion avec le Saint-Esprit »**. Le logotype et l’emblème officiels sont disponibles dans `assets/logo-koinonia.png` et `assets/logo-koinonia1.png`. La référence visuelle mobile est `../design/DESIGN_SYSTEM_KOINONIA.md` dans le dossier de projet Koinonia.

## Evidence on Hand

- `components/AuthFlow.tsx`, `lib/auth-client.ts` et `lib/account-api.ts` raccordent les parcours de compte et de profil aux services de développement. `../koinonia-api/README.md` décrit les fonctions disponibles et leurs conditions de vérification.
- Les écrans de consultation utilisent les données de démonstration du dossier `data/`. Les communautés choisies à l’intégration sont enregistrées comme préférences. Le flux de demande d’adhésion reste à raccorder. Le texte biblique livré dans `data/bible.ts` couvre une sélection de chapitres.
- Dans le dossier parent, `PRODUCT.md` et `Contexte_et_cadrage_MVP.md` décrivent le périmètre global. Le système de design mobile consigne la décision d’ouvrir **Accueil** à la fin de l’intégration.

## Product Principles

1. Donner un accès direct au Breakfast du jour dès l’accueil et permettre de retrouver un ancien contenu même en dehors de la période affichée.
2. Laisser le membre choisir et modifier ses informations facultatives, son historique affiché et ses alertes.
3. Rendre visibles l’état des demandes d’adhésion et les droits de participation dans chaque groupe.
4. Préserver le confort de lecture des méditations et du texte biblique pendant une consultation prolongée.

## Accessibility & Inclusion

Appliquer les exigences du système de design mobile pour les contrastes WCAG 2.2 AA, VoiceOver, TalkBack, le texte agrandi et la réduction des animations. Prévoir des sous-titres et des commandes de lecture accessibles pour les vidéos. Expliquer l’état des autorisations de notifications et permettre au membre d’accéder aux réglages du téléphone.
