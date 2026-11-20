/** @jsxImportSource react */
import React, { useState, useMemo, useRef, useEffect, type ComponentRef } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  BellOff,
  ChevronRight,
  Clock3,
  Info,
  Lock,
  MessageSquare,
  Search,
  Send,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react-native';
import { SearchBar } from './SearchBar';
import { FiligraneWatermark } from './FiligraneWatermark';
import {
  initialCommunities,
  type Community,
  type CommunityMessage,
} from '../data/communities';
import { controls, fonts, homeTheme as c } from '../lib/theme';

type Props = {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  initialGroupId?: string;
  navHeight?: number;
  onDetailOpenChange?: (open: boolean) => void;
};

const CATEGORIES = ['Tous', 'Prière', 'Villes', 'Jeunesse', 'Méditation', 'Famille'] as const;

export function GroupsScreen({
  onBack,
  onOpenProfile,
  onOpenNotifications,
  initialGroupId,
  navHeight = 80,
  onDetailOpenChange,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;

  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Community | null>(() => {
    if (initialGroupId) {
      return initialCommunities.find(g => g.id === initialGroupId) || null;
    }
    return null;
  });

  // État du chat interne
  const [inputText, setInputText] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const chatScrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // Synchronisation masquage de la bottom bar
  useEffect(() => {
    if (onDetailOpenChange) {
      onDetailOpenChange(selectedGroup !== null);
    }
  }, [selectedGroup, onDetailOpenChange]);

  // Gestion du retour physique Android
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showInfoModal) {
        setShowInfoModal(false);
        return true;
      }
      if (selectedGroup) {
        setSelectedGroup(null);
        return true;
      }
      if (searchQuery.trim().length > 0) {
        setSearchQuery('');
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [selectedGroup, showInfoModal, searchQuery, onBack]);

  // Filtrage des groupes
  const filteredCommunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return communities.filter(g => {
      // Filtrage par onglet
      if (activeTab === 'my-groups') {
        if (g.status === 'discoverable') return false;
      } else {
        if (g.status !== 'discoverable') return false;
      }

      // Filtrage par catégorie (dans découvrir)
      if (activeTab === 'discover' && selectedCategory !== 'Tous') {
        if (g.category !== selectedCategory) return false;
      }

      // Filtrage par recherche textuelle
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.adminName.toLowerCase().includes(q)
      );
    });
  }, [communities, activeTab, selectedCategory, searchQuery]);

  // Séparation pour "Mes groupes" : actifs vs en attente
  const myActiveGroups = useMemo(
    () => filteredCommunities.filter(g => g.status === 'member'),
    [filteredCommunities]
  );
  const myPendingGroups = useMemo(
    () => filteredCommunities.filter(g => g.status === 'pending'),
    [filteredCommunities]
  );

  // Demande d'adhésion
  const handleRequestJoin = (group: Community) => {
    setCommunities(prev =>
      prev.map(g => (g.id === group.id ? { ...g, status: 'pending' } : g))
    );
    Alert.alert(
      'Demande transmise',
      `Votre demande pour rejoindre « ${group.name} » a bien été envoyée à l’administrateur (${group.adminName}). Vous serez notifié dès sa validation.`,
      [{ text: 'Compris' }]
    );
  };

  // Toggle notifications pour ce groupe
  const handleToggleNotifications = (groupId: string) => {
    setCommunities(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          const next = !g.notificationsEnabled;
          Alert.alert(
            next ? 'Notifications activées' : 'Notifications désactivées',
            next
              ? `Vous recevrez les alertes de messages pour « ${g.name} ».`
              : `Les alertes de messages sont désormais en sourdine pour « ${g.name} ».`
          );
          return { ...g, notificationsEnabled: next };
        }
        return g;
      })
    );
  };

  // Envoi d'un message dans le groupe
  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || !selectedGroup) return;

    const newMessage: CommunityMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'Moi',
      avatarInitials: 'M',
      text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setCommunities(prev =>
      prev.map(g => {
        if (g.id === selectedGroup.id) {
          return {
            ...g,
            messages: [...g.messages, newMessage],
          };
        }
        return g;
      })
    );

    setSelectedGroup(prev =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
    );

    setInputText('');

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // --- RENDU : VUE DE CONVERSATION D’UNE COMMUNAUTÉ (CHAT) ---
  if (selectedGroup) {
    const isMember = selectedGroup.status === 'member';

    return (
      <View style={s.root}>
        <FiligraneWatermark opacity={0.15} />
        <View style={s.grow}>
          {/* Header du Chat */}
          <View style={s.chatHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour aux communautés"
              onPress={() => setSelectedGroup(null)}
              style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
            >
              <ArrowLeft size={22} color={c.text} strokeWidth={2} />
            </Pressable>

            {/* Avatar et Infos du groupe */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Détails de ${selectedGroup.name}`}
              onPress={() => setShowInfoModal(true)}
              style={s.chatHeaderCenter}
            >
              <Image source={selectedGroup.image} style={s.chatHeaderAvatar} resizeMode="cover" />
              <View style={s.chatHeaderTexts}>
                <Text numberOfLines={1} style={s.chatHeaderTitle}>
                  {selectedGroup.name}
                </Text>
                <Text numberOfLines={1} style={s.chatHeaderSubtitle}>
                  {selectedGroup.membersCount} membres {selectedGroup.readOnly ? '· Lecture seule' : ''}
                </Text>
              </View>
            </Pressable>

            {/* Actions : Cloche de notification et Info */}
            <View style={s.chatHeaderActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  selectedGroup.notificationsEnabled
                    ? 'Désactiver les alertes pour ce groupe'
                    : 'Activer les alertes pour ce groupe'
                }
                onPress={() => handleToggleNotifications(selectedGroup.id)}
                style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
              >
                {selectedGroup.notificationsEnabled ? (
                  <Bell size={20} color={c.action} strokeWidth={2} />
                ) : (
                  <BellOff size={20} color={c.muted} strokeWidth={1.5} />
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Informations sur la communauté"
                onPress={() => setShowInfoModal(true)}
                style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
              >
                <Info size={20} color={c.text} strokeWidth={1.75} />
              </Pressable>
            </View>
          </View>

          {/* Modal / Tiroir d'informations sur la communauté */}
          {showInfoModal && (
            <View style={s.infoCardDrawer}>
              <View style={s.infoCardDrawerHeader}>
                <Text style={s.infoCardDrawerTitle}>À propos de la communauté</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fermer les informations"
                  onPress={() => setShowInfoModal(false)}
                  style={s.infoCloseBtn}
                >
                  <X size={18} color={c.text} />
                </Pressable>
              </View>
              <Text style={s.infoCardDrawerBody}>{selectedGroup.description}</Text>
              <View style={s.infoMetaRow}>
                <Text style={s.infoMetaLabel}>Responsable :</Text>
                <Text style={s.infoMetaValue}>{selectedGroup.adminName}</Text>
              </View>
              <View style={s.infoMetaRow}>
                <Text style={s.infoMetaLabel}>Mode d’échange :</Text>
                <Text style={s.infoMetaValue}>
                  {selectedGroup.readOnly
                    ? 'Lecture seule (annonces officielles)'
                    : 'Discussions et prières ouvertes à tous'}
                </Text>
              </View>
            </View>
          )}

          {/* Fil de discussion */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={s.grow}
          >
            <ScrollView
              ref={chatScrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.chatMessagesContainer}
            >
              {/* Message de bienvenue et règles spirituelles */}
              <View style={s.welcomeSystemBox}>
                <Shield size={20} color={c.action} />
                <Text style={s.welcomeSystemTitle}>Espace de communion fraternelle</Text>
                <Text style={s.welcomeSystemText}>
                  Les échanges ici sont fondés sur l’édification mutuelle, le respect et la prière.
                </Text>
              </View>

              {/* Date du jour */}
              <View style={s.dateDivider}>
                <View style={s.dateDividerLine} />
                <Text style={s.dateDividerText}>Aujourd’hui</Text>
                <View style={s.dateDividerLine} />
              </View>

              {/* Messages du groupe */}
              {selectedGroup.messages.map(msg => (
                <View
                  key={msg.id}
                  style={[s.messageRow, msg.isMe ? s.messageRowMe : s.messageRowOther]}
                >
                  {!msg.isMe && (
                    <View style={s.senderAvatar}>
                      <Text style={s.senderAvatarText}>{msg.avatarInitials}</Text>
                    </View>
                  )}

                  <View
                    style={[
                      s.messageBubble,
                      msg.isMe ? s.messageBubbleMe : s.messageBubbleOther,
                    ]}
                  >
                    {!msg.isMe && (
                      <View style={s.senderHeaderRow}>
                        <Text style={s.senderName}>{msg.senderName}</Text>
                        {msg.senderRole === 'Admin' && (
                          <View style={s.adminBadge}>
                            <Text style={s.adminBadgeText}>Admin</Text>
                          </View>
                        )}
                        {msg.senderRole === 'Animateur' && (
                          <View style={s.animBadge}>
                            <Text style={s.animBadgeText}>Animateur</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <Text style={[s.messageText, msg.isMe && s.messageTextMe]}>
                      {msg.text}
                    </Text>

                    <Text style={[s.messageTime, msg.isMe && s.messageTimeMe]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Zone de saisie OU Banderole Lecture seule */}
            {selectedGroup.readOnly ? (
              <View style={[s.readOnlyBanner, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Lock size={18} color="#6B4823" />
                <View style={s.readOnlyTexts}>
                  <Text style={s.readOnlyTitle}>Mode lecture seule</Text>
                  <Text style={s.readOnlySubtitle}>
                    Seuls les administrateurs peuvent publier dans cette communauté.
                  </Text>
                </View>
              </View>
            ) : isMember ? (
              <View
                style={[
                  s.chatComposerRoot,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                {/* Raccourcis émojis rapides */}
                <View style={s.quickEmojisRow}>
                  {['🙏 Amen', '🙌 Gloire à Dieu', '🔥', '❤️', 'Prière'].map(item => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      onPress={() => setInputText(prev => (prev ? `${prev} ${item}` : item))}
                      style={({ pressed }) => [s.emojiChip, pressed && s.pressed]}
                    >
                      <Text style={s.emojiChipText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Champ de saisie et bouton d'envoi */}
                <View style={s.chatInputBar}>
                  <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Écrire un message ou un sujet de prière…"
                    placeholderTextColor={c.muted}
                    style={s.chatTextInput}
                    multiline
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Envoyer le message"
                    disabled={!inputText.trim()}
                    onPress={handleSendMessage}
                    style={({ pressed }) => [
                      s.sendBtn,
                      !inputText.trim() && s.sendBtnDisabled,
                      pressed && s.pressed,
                    ]}
                  >
                    <Send size={18} color="#FFFFFF" strokeWidth={2} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={[s.pendingBanner, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Clock3 size={18} color={c.action} strokeWidth={controls.iconStroke} />
                <Text style={s.pendingBannerText}>
                  Votre demande est en cours de validation par les responsables.
                </Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }

  // --- RENDU : PAGE PRINCIPALE DES COMMUNAUTÉS ---
  return (
    <View style={s.root}>
      <FiligraneWatermark opacity={0.15} />
      <View style={s.grow}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.mainScroll,
            { paddingHorizontal: gutter, paddingBottom: navHeight + insets.bottom + 36 },
          ]}
        >
          {/* En-tête */}
          <View style={s.headerRow}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour à l’accueil"
                onPress={onBack}
                style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
              >
                <ArrowLeft size={22} color={c.text} strokeWidth={2} />
              </Pressable>
            ) : null}

            <View style={s.titleBlock}>
              <Text accessibilityRole="header" style={s.pageTitle}>
                Communautés
              </Text>
              <Text style={s.pageSubtitle}>Prière fraternelle et partage</Text>
            </View>

            <View style={s.headerActions}>
              {onOpenNotifications && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ouvrir les notifications"
                  onPress={onOpenNotifications}
                  style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
                >
                  <Bell size={22} color={c.text} strokeWidth={1.5} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Barre de recherche dédiée */}
          <View style={s.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Rechercher une communauté, un thème, une ville…"
            />
          </View>

          {/* Deux onglets principaux : « Mes groupes » et « Découvrir » */}
          <View accessibilityRole="tablist" style={s.tabsContainer}>
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Onglet Mes groupes"
              accessibilityState={{ selected: activeTab === 'my-groups' }}
              onPress={() => setActiveTab('my-groups')}
              style={({ pressed }) => [
                s.modeTab,
                activeTab === 'my-groups' && s.modeTabActive,
                pressed && s.pressed,
              ]}
            >
              <Users
                size={18}
                color={activeTab === 'my-groups' ? '#FFFFFF' : c.muted}
                strokeWidth={2}
              />
              <Text
                style={[
                  s.modeTabLabel,
                  activeTab === 'my-groups' && s.modeTabLabelActive,
                ]}
              >
                Mes groupes ({myActiveGroups.length + myPendingGroups.length})
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Onglet Découvrir"
              accessibilityState={{ selected: activeTab === 'discover' }}
              onPress={() => setActiveTab('discover')}
              style={({ pressed }) => [
                s.modeTab,
                activeTab === 'discover' && s.modeTabActive,
                pressed && s.pressed,
              ]}
            >
              <Sparkles
                size={18}
                color={activeTab === 'discover' ? '#FFFFFF' : c.muted}
                strokeWidth={2}
              />
              <Text
                style={[
                  s.modeTabLabel,
                  activeTab === 'discover' && s.modeTabLabelActive,
                ]}
              >
                Découvrir
              </Text>
            </Pressable>
          </View>

          {/* Filtres par thèmes si dans l'onglet « Découvrir » */}
          {activeTab === 'discover' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.chipScroller}
              contentContainerStyle={s.chipScrollerContent}
            >
              {CATEGORIES.map(category => {
                const selected = selectedCategory === category;
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="button"
                    accessibilityLabel={`Catégorie ${category}`}
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedCategory(category)}
                    style={({ pressed }) => [
                      s.categoryChip,
                      selected && s.categoryChipActive,
                      pressed && s.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        s.categoryChipText,
                        selected && s.categoryChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {/* CONTENU DE L'ONGLET « MES GROUPES » */}
          {activeTab === 'my-groups' && (
            <View style={s.groupsSection}>
              {/* Groupes actifs */}
              {myActiveGroups.length > 0 && (
                <View style={s.sectionBlock}>
                  <Text accessibilityRole="header" style={s.sectionHeaderTitle}>Groupes rejoints</Text>
                  <View style={s.cardList}>
                    {myActiveGroups.map(group => (
                      <Pressable
                        key={group.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Ouvrir le groupe ${group.name}`}
                        onPress={() => setSelectedGroup(group)}
                        style={({ pressed }) => [s.groupCard, pressed && s.pressed]}
                      >
                        <Image source={group.image} style={s.groupAvatar} resizeMode="cover" />

                        <View style={s.groupDetails}>
                          <View style={s.groupTitleRow}>
                            <Text textBreakStrategy="balanced" style={s.groupName}>
                              {group.name}
                            </Text>
                            {group.unreadCount > 0 && (
                              <View style={s.unreadBadge}>
                                <Text style={s.unreadText}>{group.unreadCount}</Text>
                              </View>
                            )}
                          </View>

                          <Text numberOfLines={2} style={s.groupDesc}>
                            {group.description}
                          </Text>

                          <View style={s.groupMetaRow}>
                            <Text style={s.membersCountText}>
                              {group.membersCount} membres
                            </Text>
                            {group.readOnly && (
                              <View style={s.readOnlyPill}>
                                <Lock size={11} color="#6B4823" />
                                <Text style={s.readOnlyPillText}>Lecture seule</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <ChevronRight size={18} color={c.muted} strokeWidth={1.5} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Groupes en attente de validation */}
              {myPendingGroups.length > 0 && (
                <View style={s.sectionBlock}>
                  <Text accessibilityRole="header" style={s.sectionHeaderTitle}>Demandes en attente</Text>
                  <View style={s.cardList}>
                    {myPendingGroups.map(group => (
                      <View key={group.id} style={s.groupCardPending}>
                        <Image source={group.image} style={s.groupAvatar} resizeMode="cover" />

                        <View style={s.groupDetails}>
                          <Text textBreakStrategy="balanced" style={s.groupName}>
                            {group.name}
                          </Text>
                          <Text numberOfLines={2} style={s.groupDesc}>
                            {group.description}
                          </Text>

                          <View style={s.pendingBadge}>
                            <Clock3 size={14} color={c.amberText} strokeWidth={controls.iconStroke} />
                            <Text style={s.pendingBadgeText}>En attente</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* État vide si aucun groupe rejoint */}
              {myActiveGroups.length === 0 && myPendingGroups.length === 0 && (
                <View style={s.emptyState}>
                  <View style={s.emptyIconCircle}>
                    <Users size={36} color={c.action} strokeWidth={1.5} />
                  </View>
                  <Text style={s.emptyTitle}>Aucune communauté pour l’instant</Text>
                  <Text style={s.emptySubtitle}>
                    Découvrez les communautés de prière et d’intercession proposées par Koinonia
                    pour cheminer ensemble dans la foi.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Découvrir les communautés"
                    onPress={() => setActiveTab('discover')}
                    style={({ pressed }) => [s.emptyActionBtn, pressed && s.pressed]}
                  >
                    <Text style={s.emptyActionBtnText}>Explorer les communautés</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {/* CONTENU DE L'ONGLET « DÉCOUVRIR » */}
          {activeTab === 'discover' && (
            <View style={s.groupsSection}>
              {filteredCommunities.length === 0 ? (
                <View style={s.emptyState}>
                  <Text style={s.emptyTitle}>Aucune communauté trouvée</Text>
                  <Text style={s.emptySubtitle}>
                    Aucune communauté ne correspond à vos critères de recherche. Essayez un autre
                    thème.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tous');
                    }}
                    style={({ pressed }) => [s.emptyActionBtn, pressed && s.pressed]}
                  >
                    <Text style={s.emptyActionBtnText}>Réinitialiser les filtres</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={s.cardList}>
                  {filteredCommunities.map(group => (
                    <View key={group.id} style={s.discoverCard}>
                      <Image source={group.image} style={s.discoverCover} resizeMode="cover" />

                      <View style={s.discoverContent}>
                        <View style={s.discoverTopRow}>
                          <View style={s.categoryTagBadge}>
                            <Text style={s.categoryTagText}>{group.category}</Text>
                          </View>
                          {group.readOnly && (
                            <View style={s.readOnlyPill}>
                              <Lock size={11} color="#6B4823" />
                              <Text style={s.readOnlyPillText}>Lecture seule</Text>
                            </View>
                          )}
                        </View>

                        <Text style={s.discoverTitle}>{group.name}</Text>
                        <Text style={s.discoverDesc}>{group.description}</Text>

                        <View style={s.discoverFooter}>
                          <Text style={s.discoverMeta}>
                            {group.membersCount} membres · {group.adminName}
                          </Text>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Demander à rejoindre ${group.name}`}
                            onPress={() => handleRequestJoin(group)}
                            style={({ pressed }) => [s.joinButton, pressed && s.pressed]}
                          >
                            <UserPlus size={16} color="#FFFFFF" strokeWidth={2} />
                            <Text style={s.joinButtonText}>Rejoindre</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.canvas,
  },
  grow: {
    flex: 1,
  },
  mainScroll: {
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  titleBlock: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: c.text,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.muted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: c.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.divider,
  },
  searchContainer: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 28,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    minHeight: controls.touchSize,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    gap: 8,
    padding: 8,
  },
  modeTabActive: {
    backgroundColor: c.action,
  },
  modeTabLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.muted,
    textAlign: 'center',
  },
  modeTabLabelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  chipScroller: {
    marginBottom: 18,
    marginHorizontal: -4,
  },
  chipScrollerContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryChip: {
    minHeight: controls.touchSize,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
  },
  categoryChipActive: {
    backgroundColor: c.mint,
    borderColor: c.action,
  },
  categoryChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.muted,
  },
  categoryChipTextActive: {
    color: c.action,
    fontFamily: fonts.heading,
  },
  groupsSection: {
    gap: 20,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeaderTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: c.text,
    marginLeft: 2,
  },
  cardList: {
    gap: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: c.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.divider,
    gap: 12,
  },
  groupCardPending: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F8F5',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E6E0D4',
    gap: 12,
  },
  groupAvatar: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#1B293D',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: controls.photoOutline,
  },
  groupDetails: {
    flex: 1,
    gap: 3,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: c.text,
    flexShrink: 1,
  },
  unreadBadge: {
    backgroundColor: c.action,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  unreadText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    color: '#FFFFFF',
  },
  groupDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: c.muted,
    lineHeight: 18,
  },
  groupMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  membersCountText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
  },
  readOnlyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7E9D3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  readOnlyPillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#6B4823',
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: c.amberSurface,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingBadgeText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.amberText,
  },
  // DISCOVER CARD
  discoverCard: {
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.divider,
    overflow: 'hidden',
    shadowColor: '#111A2A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  discoverCover: {
    width: '100%',
    height: 120,
  },
  discoverContent: {
    padding: 16,
    gap: 8,
  },
  discoverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTagBadge: {
    backgroundColor: c.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.action,
  },
  discoverTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: c.text,
  },
  discoverDesc: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: c.muted,
  },
  discoverFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
  },
  discoverMeta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
    flex: 1,
  },
  joinButton: {
    backgroundColor: c.action,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinButtonText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.divider,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: c.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: c.action,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionBtnText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: '#FFFFFF',
  },
  // CHAT STYLES
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
    backgroundColor: c.surface,
    gap: 12,
  },
  chatHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  chatHeaderTexts: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: c.text,
  },
  chatHeaderSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.muted,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCardDrawer: {
    padding: 16,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
    gap: 8,
  },
  infoCardDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCardDrawerTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: c.text,
  },
  infoCloseBtn: {
    padding: 4,
  },
  infoCardDrawerBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: c.muted,
  },
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoMetaLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.text,
  },
  infoMetaValue: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.action,
  },
  chatMessagesContainer: {
    padding: 16,
    gap: 14,
  },
  welcomeSystemBox: {
    alignItems: 'center',
    padding: 14,
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.divider,
    gap: 4,
    marginBottom: 8,
  },
  welcomeSystemTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: c.text,
    marginTop: 2,
  },
  welcomeSystemText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.muted,
    textAlign: 'center',
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dateDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: c.divider,
  },
  dateDividerText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.muted,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderAvatarText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: c.action,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  messageBubbleOther: {
    backgroundColor: c.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: c.divider,
  },
  messageBubbleMe: {
    backgroundColor: c.action,
    borderBottomRightRadius: 4,
  },
  senderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: c.text,
  },
  adminBadge: {
    backgroundColor: '#F7E9D3',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#6B4823',
  },
  animBadge: {
    backgroundColor: c.mint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  animBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: c.action,
  },
  messageText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: c.text,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: c.muted,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.75)',
  },
  chatComposerRoot: {
    backgroundColor: c.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  quickEmojisRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  emojiChip: {
    backgroundColor: '#F0ECE1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emojiChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.text,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F4F2EC',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: c.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.action,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7E9D3',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8D4B8',
  },
  readOnlyTexts: {
    flex: 1,
  },
  readOnlyTitle: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: '#6B4823',
  },
  readOnlySubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#3F2C18',
    marginTop: 1,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: c.mint,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pendingBannerText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.action,
  },
  pressed: {
    opacity: controls.pressedOpacity,
  },
});
