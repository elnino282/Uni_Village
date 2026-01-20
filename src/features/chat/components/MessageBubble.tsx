/**
 * MessageBubble Component
 * Renders a single text message bubble (incoming or outgoing)
 * Supports group chat sender labels
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
}

/**
 * Chat message bubble with timestamp and optional sender label
 */
export const MessageBubble = React.memo(function MessageBubble({
  text,
  sender,
  timeLabel,
  status,
  senderName,
  senderAvatar,
  isGroupChat = false,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const isMe = sender === 'me';
  const showSenderLabel = isGroupChat && !isMe && senderName;

  // Figma colors
  const bubbleBackgroundColor = isMe ? colors.fabBlue : colors.chipBackground;
  const textColor = isMe ? '#FFFFFF' : colors.textPrimary;
  const timestampColor = colors.separatorDot;

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
        {isMe && status && (
          <View style={styles.statusIcon}>
            <Ionicons
              name={status === 'read' ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={timestampColor}
            />
          </View>
        )}
      </View>
    </View>
  );
});

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
});
