/**
 * MessageList Component
 * Virtualized list of chat messages
 * Matches Figma node 317:2269
 */
import React, { useCallback, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Spinner } from '@/shared/components/ui';
import { Colors, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { SharedCardMessage } from './SharedCardMessage';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

/**
 * Renders individual message item
 */
function MessageItem({ message }: { message: Message }) {
  if (message.type === 'sharedCard') {
    return (
      <SharedCardMessage
        card={message.card}
        timeLabel={message.timeLabel}
        status={message.status}
      />
    );
  }

  return (
    <MessageBubble
      text={message.text}
      sender={message.sender}
      timeLabel={message.timeLabel}
      status={message.status}
    />
  );
}

/**
 * Chat message list with auto-scroll
 */
export function MessageList({ messages, isLoading }: MessageListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList<Message>>(null);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    return <MessageItem message={item} />;
  }, []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  // Scroll to bottom when new messages arrive
  const handleContentSizeChange = useCallback(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.list, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      onContentSizeChange={handleContentSizeChange}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={15}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
