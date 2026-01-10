/**
 * ChatThreadScreen Component
 * Main chat thread screen composition
 * Matches Figma node 317:2269
 */
import BottomSheet from '@gorhom/bottom-sheet';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import type { Itinerary } from '@/features/itinerary/types/itinerary.types';
import {
  getItineraryCoverImage,
} from '@/features/itinerary/types/itinerary.types';
import { EmptyState } from '@/shared/components/feedback';
import { Colors } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

// Import i18n config
import '@/lib/i18n';

import { useMessages, useSendMessage, useSendSharedCard, useThread } from '../hooks';
import { ChatComposer } from './ChatComposer';
import { ChatHeader } from './ChatHeader';
import { ItineraryShareSheet } from './ItineraryShareSheet';
import { MessageList } from './MessageList';

interface ChatThreadScreenProps {
  threadId: string;
}

/**
 * Chat thread screen with header, messages, and composer
 */
export function ChatThreadScreen({ threadId }: ChatThreadScreenProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Bottom sheet ref for itinerary sharing
  const itinerarySheetRef = useRef<BottomSheet>(null);

  // Data fetching
  const { data: thread, isLoading: isLoadingThread } = useThread(threadId);
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(threadId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: sendSharedCard } = useSendSharedCard();

  // Handlers
  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ threadId, text });
    },
    [sendMessage, threadId]
  );

  const handleImagePress = useCallback(() => {
    // TODO: Implement image picker
     
    console.log('Image attachment pressed');
  }, []);

  const handleCalendarPress = useCallback(() => {
    // Open itinerary share sheet
    itinerarySheetRef.current?.expand();
  }, []);

  const handleSelectItinerary = useCallback(
    (itinerary: Itinerary) => {
      sendSharedCard({
        threadId,
        card: {
          id: itinerary.id,
          title: itinerary.title,
          imageUrl: getItineraryCoverImage(itinerary),
          ctaText: t('common.viewDetails'),
          route: `/itinerary/${itinerary.id}`,
        },
      });
    },
    [sendSharedCard, threadId, t]
  );

  const handleInfoPress = useCallback(() => {
    // TODO: Navigate to thread info screen
     
    console.log('Thread info pressed:', threadId);
  }, [threadId]);

  // Loading state for thread
  if (isLoadingThread || !thread) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="💬"
          title={t('common.loading')}
          message=""
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <ChatHeader thread={thread} onInfoPress={handleInfoPress} />

      {/* Main content with keyboard avoidance */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages list */}
        <MessageList messages={messages} isLoading={isLoadingMessages} />

        {/* Input composer */}
        <ChatComposer
          onSend={handleSend}
          onImagePress={handleImagePress}
          onCalendarPress={handleCalendarPress}
          isSending={isSending}
        />
      </KeyboardAvoidingView>

      {/* Itinerary Share Bottom Sheet */}
      <ItineraryShareSheet
        ref={itinerarySheetRef}
        onSelectItinerary={handleSelectItinerary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
});
