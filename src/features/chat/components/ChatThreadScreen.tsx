/**
 * ChatThreadScreen Component
 * Main chat thread screen composition - supports both DM and Group chats
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import BottomSheet from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import type { Itinerary } from "@/features/itinerary/types/itinerary.types";
import { getItineraryCoverImage } from "@/features/itinerary/types/itinerary.types";
import { EmptyState } from "@/shared/components/feedback";
import { Colors } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";

// Import i18n config
import "@/lib/i18n";

import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useMessages,
  useSendMessageHybrid,
  useSendSharedCard,
  useThread,
} from "../hooks";
import { isVirtualThreadId } from "../services";
import type {
  ChatMessageRecord,
  ChatThread,
  GroupThread,
  ImageMessage,
  Message,
  TextMessage,
  UserPreview,
} from "../types";
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
 * Map Firestore message record to local Message type
 */
function mapMessageRecord(msg: ChatMessageRecord, currentUserId?: number): Message {
  const isSentByMe = currentUserId ? msg.senderId === currentUserId : false;
  const time = msg.createdAt ? new Date(msg.createdAt) : new Date();
  const timeLabel = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const status = msg._status || 'sent';
  const isUnsent = msg.isActive === false;

  if (isUnsent) {
    return {
      id: msg.id,
      type: 'text' as const,
      text: 'Tin nhắn đã bị thu hồi',
      sender: isSentByMe ? 'me' : 'other',
      createdAt: msg.createdAt,
      timeLabel,
      status,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatarUrl,
      messageId: msg.id,
      conversationId: msg.conversationId,
      isUnsent,
    } satisfies TextMessage;
  }

  if (msg.messageType === 'image') {
    const imageUrl = msg.imageUrl;

    if (!imageUrl) {
      console.warn(`[Chat] Message ${msg.id} has IMAGE type but missing imageUrl`);
      return {
        id: msg.id,
        type: 'text' as const,
        text: '📷 [Image unavailable]',
        sender: isSentByMe ? 'me' : 'other',
        createdAt: msg.createdAt,
        timeLabel,
        status,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatarUrl,
        messageId: msg.id,
        conversationId: msg.conversationId,
        isUnsent,
      } satisfies TextMessage;
    }

    return {
      id: msg.id,
      type: 'image' as const,
      imageUrl,
      caption: msg.content,
      sender: isSentByMe ? 'me' : 'other',
      createdAt: msg.createdAt,
      timeLabel,
      status,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatarUrl,
      messageId: msg.id,
      conversationId: msg.conversationId,
      isUnsent,
    } satisfies ImageMessage;
  }

  if (msg.messageType === 'sharedCard' && msg.card) {
    return {
      id: msg.id,
      type: 'sharedCard' as const,
      card: msg.card,
      sender: isSentByMe ? 'me' : 'other',
      createdAt: msg.createdAt,
      timeLabel,
      status,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatarUrl,
      messageId: msg.id,
      conversationId: msg.conversationId,
      isUnsent,
    };
  }

  return {
    id: msg.id,
    type: 'text' as const,
    text: isUnsent ? 'Tin nhắn đã bị thu hồi' : (msg.content ?? ''),
    sender: isSentByMe ? 'me' : 'other',
    createdAt: msg.createdAt,
    timeLabel,
    status,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatarUrl,
    messageId: msg.id,
    conversationId: msg.conversationId,
    isUnsent,
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
  const routerInstance = useRouter();

  // State for attachments
  const [attachments, setAttachments] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Bottom sheet refs
  const itinerarySheetRef = useRef<BottomSheet>(null);
  const addMemberSheetRef = useRef<AddMemberBottomSheetRef>(null);

  // Auth for current user ID
  const currentUserId = useAuthStore(state => state.user?.id);

  // Data fetching
  const { data: thread, isLoading: isLoadingThread } = useThread(threadId);
  const messagesQuery = useMessages(threadId);
  const { sendMessage: sendMessageHybrid, sendImage } = useSendMessageHybrid();
  const { mutateAsync: sendSharedCard } = useSendSharedCard();

  // Flatten and map messages
  const rawMessages = messagesQuery.data ?? [];
  const messages: Message[] = rawMessages.map(msg => mapMessageRecord(msg, currentUserId));
  const isLoadingMessages = messagesQuery.isLoading;

  // Determine if group chat
  const isGroup = thread ? isGroupThread(thread) : false;
  const groupThread = isGroup ? (thread as GroupThread) : null;
  const dmThread = !isGroup ? (thread as ChatThread | undefined) : null;

  const peerInfo = dmThread?.peer
    ? {
        id: Number(dmThread.peer.id),
        displayName: dmThread.peer.displayName,
        avatarUrl: dmThread.peer.avatarUrl,
      }
    : undefined;

  // Conversation context for DM chats - get from thread metadata
  const otherUserId = dmThread?.peer ? Number(dmThread.peer.id) : null;
  const relationshipStatus = dmThread?.relationshipStatus || 'NONE';
  const participantStatus = dmThread?.participantStatus || 'INBOX';

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
    relationshipStatus !== 'FRIEND';

  const handleSend = useCallback(
    async (text: string) => {
      const user = useAuthStore.getState().user;

      if (!user || !user.id) {
        console.error('[ChatThread] Cannot send message: User not initialized');
        console.error('[ChatThread] Please log out and log in again');

        Alert.alert(
          'Error',
          'User session expired. Please log in again.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
        return;
      }

      if (attachments.length > 0) {
        const uploadPromises = attachments.map(asset => {
          const fileName = asset.fileName || `image_${Date.now()}.jpg`;
          const fileType = asset.mimeType || 'image/jpeg';

          return sendImage(
            threadId,
            {
              uri: asset.uri,
              name: fileName,
              type: fileType,
            },
            {
              id: user.id!,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
            text,
            peerInfo
          );
        });

        try {
          const results = await Promise.all(uploadPromises);
          setAttachments([]);

          if (isVirtualThreadId(threadId) && results.length > 0) {
            const conversationId = results[0].conversationId;
            if (conversationId && conversationId !== threadId) {
              routerInstance.replace(`/chat/${conversationId}`);
            }
          }
        } catch (error) {
          console.error('[ChatThread] Failed to send one or more images:', error);
          Alert.alert('Error', 'Failed to send one or more images');
        }
      } else {
        try {
          const message = await sendMessageHybrid({
            threadId,
            text,
            recipient: peerInfo,
            senderInfo: {
              id: user.id,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
          });

          if (isVirtualThreadId(threadId) && message.conversationId && message.conversationId !== threadId) {
            console.log(`[ChatThread] Redirecting from virtual thread ${threadId} to ${message.conversationId}`);
            routerInstance.replace(`/chat/${message.conversationId}`);
          }
        } catch (error) {
          console.error('[ChatThread] Failed to send message:', error);
        }
      }
    },
    [sendMessageHybrid, threadId, attachments, sendImage, peerInfo, routerInstance]
  );

  const handleImagePress = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        setAttachments(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  }, []);

  const handleRemoveAttachment = useCallback((uri: string) => {
    setAttachments(prev => prev.filter(a => a.uri !== uri));
  }, []);

  const handleCalendarPress = useCallback(() => {
    itinerarySheetRef.current?.expand();
  }, []);

  const handleSelectItinerary = useCallback(
    async (itinerary: Itinerary) => {
      try {
        const result = await sendSharedCard({
          threadId,
          recipient: peerInfo,
          card: {
            id: itinerary.id,
            title: itinerary.title,
            imageUrl: getItineraryCoverImage(itinerary),
            ctaText: t('common.viewDetails'),
            route: `/itinerary/${itinerary.id}`,
          },
        });

        if (
          isVirtualThreadId(threadId) &&
          result?.conversationId &&
          result.conversationId !== threadId
        ) {
          routerInstance.replace(`/chat/${result.conversationId}`);
        }
      } catch (error) {
        console.error('[ChatThread] Failed to send shared card:', error);
      }
    },
    [sendSharedCard, threadId, t, peerInfo, routerInstance]
  );

  const handleInfoPress = useCallback(() => {
    if (!threadId) return;
    router.push(`/chat/${threadId}/info`);
  }, [threadId]);

  const handleNotificationPress = useCallback(() => {
    console.log('Group notification settings:', threadId);
  }, [threadId]);

  const handleAddMemberPress = useCallback(() => {
    addMemberSheetRef.current?.open();
  }, []);

  const handleMembersAdded = useCallback((users: UserPreview[]) => {
    console.log('Members added:', users.map((u) => u.displayName).join(', '));
  }, []);

  const handlePinnedDismiss = useCallback(() => {
    console.log('Pinned message dismissed');
  }, []);

  if (isLoadingThread || !thread) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }] }>
        <EmptyState icon="💬" title={t('common.loading')} message="" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
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

      {shouldShowMessageRequestBanner && otherUserId && (
        <AcceptMessageRequestBanner
          conversationId={threadId}
          senderName={dmThread!.peer.displayName}
        />
      )}

      {shouldShowAddFriendBanner && otherUserId && (
        <AddFriendBanner
          otherUserId={otherUserId}
          otherUserName={dmThread!.peer.displayName}
          relationshipStatus={relationshipStatus}
          onStatusChange={() => {}}
        />
      )}

      {isGroup && groupThread?.pinnedMessage && (
        <PinnedMessageBar
          pinnedMessage={groupThread.pinnedMessage}
          onDismiss={handlePinnedDismiss}
        />
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          isGroupChat={isGroup}
        />

        <ChatComposer
          onSend={handleSend}
          onImagePress={handleImagePress}
          onCalendarPress={handleCalendarPress}
          isSending={false}
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
        />
      </KeyboardAvoidingView>

      <ItineraryShareSheet
        ref={itinerarySheetRef}
        onSelectItinerary={handleSelectItinerary}
      />

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
