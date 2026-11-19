/** @jsxImportSource react */
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  CirclePlay,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react-native';
import { AppNotification, NotificationCategory } from '../data/notifications';
import { fonts, homeTheme as c } from '../lib/theme';

type Props = {
  visible: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onSelectNotification: (item: AppNotification) => void;
  onMarkAllAsRead: () => void;
  onOpenSettings?: () => void;
};

export function NotificationsMenu({
  visible,
  notifications,
  onClose,
  onSelectNotification,
  onMarkAllAsRead,
  onOpenSettings,
}: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'breakfast':
        return <CirclePlay size={18} color={c.action} strokeWidth={1.8} />;
      case 'community':
        return <Users size={18} color={c.action} strokeWidth={1.8} />;
      case 'bible':
        return <BookOpen size={18} color={c.action} strokeWidth={1.8} />;
      case 'event':
        return <Calendar size={18} color={c.action} strokeWidth={1.8} />;
      default:
        return <Sparkles size={18} color={c.action} strokeWidth={1.8} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.modalOverlay}>
        {/* Scrim to dismiss */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le menu des notifications"
          onPress={onClose}
          style={s.scrim}
        />

        {/* Floating Contextual Menu Card anchored at top-right */}
        <View
          style={[
            s.menuCard,
            s.cardShadow,
            {
              top: insets.top + 54,
              width: Math.min(width - 24, 370),
              right: Math.max((width - Math.min(width - 24, 370)) / 2, 12),
            },
          ]}
        >
          {/* Header */}
          <View style={s.menuHeader}>
            <View style={s.titleRow}>
              <Text accessibilityRole="header" style={s.menuTitle}>Notifications</Text>
              {unreadCount > 0 ? (
                <View style={s.unreadPill}>
                  <Text style={s.unreadPillText}>{unreadCount} nouv.</Text>
                </View>
              ) : null}
            </View>

            <View style={s.headerActions}>
              {unreadCount > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tout marquer comme lu"
                  onPress={onMarkAllAsRead}
                  style={({ pressed }) => [s.markAllBtn, pressed && s.pressed]}
                >
                  <CheckCheck size={16} color={c.action} strokeWidth={2} />
                  <Text style={s.markAllText}>Tout lire</Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={onClose}
                style={({ pressed }) => [s.closeBtn, pressed && s.pressed]}
              >
                <X size={18} color={c.muted} strokeWidth={1.8} />
              </Pressable>
            </View>
          </View>

          {/* Notifications Scroll List */}
          {notifications.length === 0 ? (
            <View style={s.emptyBox}>
              <View style={s.emptyIconCircle}>
                <Bell size={24} color={c.muted} strokeWidth={1.5} />
              </View>
              <Text style={s.emptyTitle}>Tout est calme</Text>
              <Text style={s.emptySubtitle}>Vous n’avez aucune notification pour le moment.</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={s.notificationsList}
              contentContainerStyle={s.listContent}
            >
              {notifications.map((item, index) => {
                const isLast = index === notifications.length - 1;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}, ${item.message}. ${item.read ? 'Lu' : 'Non lu'}`}
                    onPress={() => onSelectNotification(item)}
                    style={({ pressed }) => [
                      s.notifRow,
                      !item.read && s.notifRowUnread,
                      !isLast && s.rowDivider,
                      pressed && s.pressed,
                    ]}
                  >
                    {/* Category Icon */}
                    <View style={[s.iconBox, !item.read && s.iconBoxUnread]}>
                      {getCategoryIcon(item.category)}
                    </View>

                    {/* Content */}
                    <View style={s.notifContent}>
                      <View style={s.notifTitleRow}>
                        <Text
                          style={[s.notifTitle, !item.read && s.notifTitleUnread]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {!item.read && <View style={s.unreadDot} />}
                      </View>
                      <Text style={s.notifMessage} numberOfLines={2}>
                        {item.message}
                      </Text>
                      <Text style={s.notifTime}>{item.time}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {/* Footer with Settings Shortcut */}
          {onOpenSettings && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gérer les réglages de notifications"
              onPress={() => {
                onClose();
                onOpenSettings();
              }}
              style={({ pressed }) => [s.menuFooter, pressed && s.pressed]}
            >
              <Settings size={15} color={c.action} strokeWidth={1.5} />
              <Text style={s.menuFooterText}>Gérer mes rappels & notifications</Text>
              <ChevronRight size={14} color={c.muted} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 34, 30, 0.3)',
  },
  pressed: {
    opacity: 0.75,
  },
  menuCard: {
    position: 'absolute',
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.divider,
    maxHeight: 460,
    overflow: 'hidden',
    zIndex: 999,
  },
  cardShadow: {
    shadowColor: '#0E2420',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },

  /* Header */
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
    backgroundColor: c.canvas,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: c.text,
  },
  unreadPill: {
    backgroundColor: c.action,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadPillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: c.mint,
  },
  markAllText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: c.action,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.divider,
  },

  /* Empty State */
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: c.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.muted,
    textAlign: 'center',
  },

  /* List */
  notificationsList: {
    maxHeight: 330,
  },
  listContent: {
    paddingVertical: 4,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  notifRowUnread: {
    backgroundColor: '#F3F9F8',
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F3',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: c.canvas,
    borderWidth: 1,
    borderColor: c.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconBoxUnread: {
    backgroundColor: c.mint,
    borderColor: c.mint,
  },
  notifContent: {
    flex: 1,
    minWidth: 0,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.text,
    flex: 1,
    marginRight: 6,
  },
  notifTitleUnread: {
    fontFamily: fonts.bold,
    color: '#083B37',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: c.action,
  },
  notifMessage: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: c.muted,
    marginBottom: 4,
  },
  notifTime: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#7E918E',
  },

  /* Footer */
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: c.divider,
    backgroundColor: c.canvas,
  },
  menuFooterText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: c.action,
    flex: 1,
  },
});
