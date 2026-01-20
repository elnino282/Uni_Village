/**
 * MessageBubble Component
 * Renders a single text message bubble (incoming or outgoing)
 * Supports group chat sender labels
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import type { MessageSender, MessageStatus } from '../types';
import { SenderLabel } from './SenderLabel';

interface MessageBubbleProps {
  text: string;
  sender: MessageSender;
  timeLabel: string;
  status?: MessageStatus;
  /** For group chats: sender name to display above bubble */
  senderName?: string;
  /** For group chats: sender avatar URL */
  senderAvatar?: string;
  /** Whether this is a group chat (affects layout) */
  isGroupChat?: boolean;
  /** Error message if status is error */
  errorMessage?: string;
  /** Callback for retry when message failed */
  onRetry?: () => void;
}

/**
 * Chat message bubble with timestamp and optional sender label
 */
export function MessageBubble({
  text,
  sender,
  timeLabel,
  status,
  senderName,
  senderAvatar,
  isGroupChat = false,
  errorMessage,
  onRetry,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const isMe = sender === 'me';
  const showSenderLabel = isGroupChat && !isMe && senderName;

  // Figma colors
  const bubbleBackgroundColor = isMe ? colors.fabBlue : colors.chipBackground;
  const textColor = isMe ? '#FFFFFF' : colors.textPrimary;
  const timestampColor = colors.separatorDot;

  const renderStatusIcon = () => {
    if (!isMe || !status) return null;

    if (status === 'sending') {
      return (
        <View style={styles.statusIcon}>
          <ActivityIndicator size="small" color={timestampColor} />
        </View>
      );
    }

    const iconName = status === 'read' || status === 'delivered' ? 'checkmark-done' : 'checkmark';
    const iconColor = status === 'read' || status === 'delivered' ? colors.fabBlue : timestampColor;

    return (
      <View style={styles.statusIcon}>
        <Ionicons name={iconName} size={14} color={iconColor} />
      </View>
    );
  };

  return (
    <View style={[styles.container, isMe && styles.containerMe]}>
      {/* Sender label for group chat incoming messages */}
      {showSenderLabel && (
        <SenderLabel senderName={senderName!} senderAvatar={senderAvatar} />
      )}
      
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBackgroundColor },
          isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </View>
      <View style={[styles.metaRow, isMe && styles.metaRowMe]}>
        <Text style={[styles.timestamp, { color: timestampColor }]}>
          {timeLabel}
        </Text>
        {renderStatusIcon()}
        {isMe && errorMessage && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Ionicons name="alert-circle" size={16} color={colors.error || '#FF4444'} />
            <Text style={[styles.retryText, { color: colors.error || '#FF4444' }]}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: '75%',
    marginBottom: Spacing.sm,
  },
  containerMe: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  bubbleOther: {
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    borderTopRightRadius: 4,
  },
  text: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  metaRowMe: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: Typography.weights.normal,
    lineHeight: 16.5,
  },
  statusIcon: {
    marginLeft: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
});
