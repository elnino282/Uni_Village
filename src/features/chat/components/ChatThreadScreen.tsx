/**
 * ChatThreadScreen Component
 * Main chat thread screen composition - supports both DM and Group chats
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import type { Itinerary } from "@/features/itinerary/types/itinerary.types";
import { getItineraryCoverImage } from "@/features/itinerary/types/itinerary.types";
import { EmptyState } from "@/shared/components/feedback";
import { Colors } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";

// Import i18n config
import "@/lib/i18n";

import { useAuthStore } from "@/features/auth/store/authStore";
import type { MessageResponse } from "@/shared/types/backend.types";
import type { ParticipantStatus } from "../api/conversations.api";
import type { RelationshipStatus } from "../api/friends.api";
import {
  useMessages,
  useSendMessage,
  useSendSharedCard,
  useThread,
} from "../hooks";
import type { ChatThread, GroupThread, Message, TextMessage, UserPreview } from "../types";
import { isGroupThread } from "../types";
import { AcceptMessageRequestBanner } from "./AcceptMessageRequestBanner";
import { AddFriendBanner } from "./AddFriendBanner";
import { AddMemberBottomSheet, type AddMemberBottomSheetRef } from "./AddMemberBottomSheet";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { GroupChatHeader } from "./GroupChatHeader";
import { ItineraryShareSheet } from "./ItineraryShareSheet";
import { MessageList } from "./MessageList";
import { PinnedMessageBar } from "./PinnedMessageBar";

/**
 * Map API MessageResponse to local Message type
 */
function mapMessageResponse(msg: MessageResponse, currentUserId?: string): Message {
  const isSentByMe = String(msg.senderId) === currentUserId;
  const time = msg.timestamp ? new Date(msg.timestamp) : new Date();
  const timeLabel = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return {
    id: String(msg.id ?? Date.now()),
    type: 'text' as const,
    text: msg.content ?? '',
    sender: isSentByMe ? 'me' : 'other',
    createdAt: msg.timestamp ?? new Date().toISOString(),
    timeLabel,
    status: 'sent',
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatarUrl,
  } satisfies TextMessage;
}

interface ChatThreadScreenProps {
  threadId: string;
}

/**
 * Chat thread screen with header, messages, and composer
 * Automatically renders DM or Group UI based on thread type
 */
export function ChatThreadScreen({ threadId }: ChatThreadScreenProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Bottom sheet refs
  const itinerarySheetRef = useRef<BottomSheet>(null);
  const addMemberSheetRef = useRef<AddMemberBottomSheetRef>(null);

  // Auth for current user ID
  const currentUserId = useAuthStore(state => state.user?.id);

  // Data fetching
  const { data: thread, isLoading: isLoadingThread } = useThread(threadId);
  const messagesQuery = useMessages(threadId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: sendSharedCard } = useSendSharedCard();

  // Flatten and map messages from paginated response
  const rawMessages = messagesQuery.data?.pages?.flatMap(page => page?.content || []) || [];
  const messages: Message[] = rawMessages.map(msg => mapMessageResponse(msg, currentUserId));
  const isLoadingMessages = messagesQuery.isLoading;

  // Determine if group chat
  const isGroup = thread ? isGroupThread(thread) : false;
  const groupThread = isGroup ? (thread as GroupThread) : null;
  const dmThread = !isGroup ? (thread as ChatThread | undefined) : null;

  // Conversation context for DM chats - get from thread metadata
  const otherUserId = dmThread?.peer ? parseInt(dmThread.peer.id) : null;
  const relationshipStatus = dmThread?.relationshipStatus || 'NONE';
  const participantStatus = dmThread?.participantStatus || 'INBOX';

  // Determine which banner to show
  const shouldShowMessageRequestBanner =
    !isGroup &&
    dmThread &&
    participantStatus === 'REQUEST';

  const shouldShowAddFriendBanner =
    !isGroup &&
    dmThread &&
    participantStatus === 'INBOX' &&
    relationshipStatus &&
    relationshipStatus !== 'ACCEPTED' &&
    relationshipStatus !== 'FRIEND'; // Check both status types

  // Handlers
  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ threadId, text });
    },
    [sendMessage, threadId]
  );

  const handleImagePress = useCallback(() => {
    // TODO: Implement image picker
    console.log("Image attachment pressed");
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
          ctaText: t("common.viewDetails"),
          route: `/itinerary/${itinerary.id}`,
        },
      });
    },
    [sendSharedCard, threadId, t]
  );

  const handleInfoPress = useCallback(() => {
    if (!threadId) return;
    router.push(`/chat/${threadId}/info`);
  }, [threadId]);

  // Group-specific handlers
  const handleNotificationPress = useCallback(() => {
    console.log("Group notification settings:", threadId);
  }, [threadId]);

  const handleAddMemberPress = useCallback(() => {
    addMemberSheetRef.current?.open();
  }, []);

  const handleMembersAdded = useCallback((users: UserPreview[]) => {
    console.log("Members added:", users.map((u) => u.displayName).join(", "));
  }, []);

  const handlePinnedDismiss = useCallback(() => {
    console.log("Pinned message dismissed");
  }, []);

  // Loading state for thread
  if (isLoadingThread || !thread) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="💬" title={t("common.loading")} message="" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Group or DM */}
      {isGroup && groupThread ? (
        <GroupChatHeader
          thread={groupThread}
          onNotificationPress={handleNotificationPress}
          onAddMemberPress={handleAddMemberPress}
          onInfoPress={handleInfoPress}
        />
      ) : (
        <ChatHeader thread={thread} onInfoPress={handleInfoPress} />
      )}

      {/* Message Request Banner - for REQUEST conversations */}
      {shouldShowMessageRequestBanner && otherUserId && (
        <AcceptMessageRequestBanner
          conversationId={threadId}
          senderName={dmThread!.peer.displayName}
        />
      )}

      {/* Add Friend Banner - for INBOX conversations with non-friends */}
      {shouldShowAddFriendBanner && otherUserId && (
        <AddFriendBanner
          otherUserId={otherUserId}
          otherUserName={dmThread!.peer.displayName}
          relationshipStatus={relationshipStatus}
          onStatusChange={(newStatus) => {
            // Update local state optimistically
            // The thread will refresh on next navigation or refetch
          }}
        />
      )}

      {/* Pinned message banner (group only) */}
      {isGroup && groupThread?.pinnedMessage && (
        <PinnedMessageBar
          pinnedMessage={groupThread.pinnedMessage}
          onDismiss={handlePinnedDismiss}
        />
      )}

      {/* Main content with keyboard avoidance */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages list */}
        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          isGroupChat={isGroup}
        />

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

      {/* Add Member Bottom Sheet (group only) */}
      {isGroup && groupThread && (
        <AddMemberBottomSheet
          ref={addMemberSheetRef}
          threadId={threadId}
          groupName={groupThread.name}
          onMembersAdded={handleMembersAdded}
        />
      )}
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
