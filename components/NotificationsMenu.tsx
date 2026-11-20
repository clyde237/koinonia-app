/** @jsxImportSource react */
import React, { useMemo } from 'react';
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
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

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
  const { isDark, colors: c } = useTheme();
  const s = useMemo(() => createNotificationStyles(c, isDark), [c, isDark]);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const top = insets.top + (height < 480 ? 8 : 54);
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
          accessible={false}
          importantForAccessibility="no"
          onPress={onClose}
          style={s.scrim}
        />

        {/* Floating Contextual Menu Card anchored at top-right */}
        <View
          accessibilityViewIsModal
          style={[
            s.menuCard,
            s.cardShadow,
            {
              top,
              maxHeight: Math.min(520, height - top - Math.max(insets.bottom, 12)),
              width: Math.min(width - 24, 370),
              right: Math.max((width - Math.min(width - 24, 370)) / 2, 12),
            },
          ]}
        >
          {/* Header */}
          <View style={s.menuHeader}>
            <View style={s.titleRow}>
              <Text accessibilityRole="header" style={s.menuTitle}>Notifications</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={onClose}
                style={({ pressed }) => [s.closeBtn, pressed && s.pressed]}
              >
                <X size={20} color={c.muted} strokeWidth={controls.iconStroke} />
              </Pressable>
            </View>
            {unreadCount > 0 && (
              <View style={s.readActions}>
                <Text accessibilityLiveRegion="polite" style={s.unreadCount}>
                  {unreadCount === 1 ? '1 non lue' : `${unreadCount} non lues`}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tout marquer comme lu"
                  onPress={onMarkAllAsRead}
                  style={({ pressed }) => [s.markAllBtn, pressed && s.pressed]}
                >
                  <CheckCheck size={18} color={c.action} strokeWidth={controls.iconStroke} />
                  <Text style={s.markAllText}>Tout lire</Text>
                </Pressable>
              </View>
            )}
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
                        >
                          {item.title}
                        </Text>
                        {!item.read && <View style={s.unreadDot} />}
                      </View>
                      <Text style={s.notifMessage}>
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

function createNotificationStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: isDark ? 'rgba(5, 9, 16, 0.6)' : 'rgba(17, 34, 30, 0.3)',
  },
  pressed: {
    opacity: controls.pressedOpacity,
  },
  menuCard: {
    position: 'absolute',
    backgroundColor: isDark ? c.surfaceRaised : c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? c.moonlightBorder : c.divider,
    overflow: 'hidden',
    zIndex: 999,
  },
  cardShadow: {
    shadowColor: isDark ? '#000000' : '#0E2420',
    shadowOpacity: isDark ? 0.4 : 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },

  /* Header */
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? c.moonlightBorder : c.divider,
    backgroundColor: isDark ? c.surface : c.canvas,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  menuTitle: {
    flexShrink: 1,
    fontFamily: fonts.heading,
    fontSize: 18,
    color: c.text,
  },
  unreadCount: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    color: c.muted,
  },
  readActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  markAllBtn: {
    minHeight: controls.touchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  markAllText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: c.action,
  },
  closeBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexShrink: 1,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
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
    fontSize: 12,
    color: c.muted,
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
    borderTopColor: isDark ? c.moonlightBorder : c.divider,
    backgroundColor: isDark ? c.surface : c.canvas,
  },
  menuFooterText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: c.action,
    flex: 1,
  },
  });
}
