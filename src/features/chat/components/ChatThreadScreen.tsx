/**
 * ChatThreadScreen Component
 * Main chat thread screen composition - supports both DM and Group chats
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import BottomSheet from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { auth } from "@/lib/firebase";
import {
  useMessages,
  useSendMessage,
  useSendMessageWithFiles,
  useSendSharedCard,
  useThread,
} from "../hooks";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { isVirtualThreadId } from "../services";
import {
  ensureDirectConversation,
  type ConversationParticipant,
} from "../services/firebaseRtdb.service";
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
import { TypingIndicator } from "./TypingIndicator";

/**
 * Map RTDB message record to local Message type
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
      text: 'Tin nh?n dã b? thu h?i',
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
        text: '?? [Image unavailable]',
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
    text: isUnsent ? 'Tin nh?n dã b? thu h?i' : (msg.content ?? ''),
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

  const [attachments, setAttachments] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const itinerarySheetRef = useRef<BottomSheet>(null);
  const addMemberSheetRef = useRef<AddMemberBottomSheetRef>(null);

  const currentUserId = useAuthStore(state => state.user?.id);

  const { data: thread, isLoading: isLoadingThread } = useThread(threadId);
  const messagesQuery = useMessages(threadId);
  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutateAsync: sendWithFiles } = useSendMessageWithFiles();
  const { mutateAsync: sendSharedCard } = useSendSharedCard();

  const rawMessages = messagesQuery.data ?? [];
  const messages: Message[] = rawMessages.map(msg => mapMessageRecord(msg, currentUserId));
  const isLoadingMessages = messagesQuery.isLoading;

  const isGroup = thread ? isGroupThread(thread) : false;
  const groupThread = isGroup ? (thread as GroupThread) : null;
  const dmThread = !isGroup ? (thread as ChatThread | undefined) : null;

  const recipient: ConversationParticipant | undefined = dmThread?.peer
    ? {
        uid: dmThread.peer.uid ?? dmThread.peer.id.toString(),
        displayName: dmThread.peer.displayName,
        avatarUrl: dmThread.peer.avatarUrl,
        legacyUserId: dmThread.peer.id,
      }
    : undefined;

  const otherUserId = dmThread?.peer ? dmThread.peer.id : null;
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

  const typingConversationId = useMemo(
    () => (isVirtualThreadId(threadId) ? undefined : threadId),
    [threadId]
  );

  const { sendTyping, stopTyping } = useTypingIndicator(typingConversationId);

  const resolveConversationId = useCallback(async () => {
    if (!isVirtualThreadId(threadId)) {
      return threadId;
    }

    const user = useAuthStore.getState().user;
    const firebaseUser = auth.currentUser;

    if (!user || !firebaseUser || !recipient) {
      throw new Error('Missing sender/recipient info for virtual thread');
    }

    const sender: ConversationParticipant = {
      uid: firebaseUser.uid,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      legacyUserId: user.id,
    };

    return ensureDirectConversation(sender, recipient);
  }, [recipient, threadId]);

  const handleSend = useCallback(
    async (text: string) => {
      const user = useAuthStore.getState().user;
      const firebaseUser = auth.currentUser;

      if (!user || !firebaseUser) {
        Alert.alert(
          'Error',
          'User session expired. Please log in again.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
        return;
      }

      if (!text.trim() && attachments.length === 0) {
        return;
      }

      try {
        const conversationId = await resolveConversationId();

        if (attachments.length > 0) {
          await sendWithFiles({
            conversationId,
            content: text.trim() || undefined,
            files: attachments.map((asset) => ({
              uri: asset.uri,
              name: asset.fileName || `image_${Date.now()}.jpg`,
              type: asset.mimeType || 'image/jpeg',
            })),
          });

          setAttachments([]);
        } else {
          await sendMessage({
            conversationId,
            content: text.trim(),
          });
        }

        stopTyping();

        if (isVirtualThreadId(threadId) && conversationId !== threadId) {
          routerInstance.replace(`/chat/${conversationId}`);
        }
      } catch (error) {
        console.error('[ChatThread] Failed to send message:', error);
      }
    },
    [attachments, resolveConversationId, sendMessage, sendWithFiles, stopTyping, threadId, routerInstance]
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
          recipient,
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
    [sendSharedCard, threadId, t, recipient, routerInstance]
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

  const handleComposerTextChange = useCallback(
    (value: string) => {
      if (!typingConversationId) {
        return;
      }

      if (value.trim().length > 0) {
        sendTyping();
      } else {
        stopTyping();
      }
    },
    [sendTyping, stopTyping, typingConversationId]
  );

  if (isLoadingThread || !thread) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }] }>
        <EmptyState icon="??" title={t('common.loading')} message="" />
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

        <TypingIndicator conversationId={typingConversationId} />

        <ChatComposer
          onSend={handleSend}
          onImagePress={handleImagePress}
          onCalendarPress={handleCalendarPress}
          isSending={false}
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
          onTextChange={handleComposerTextChange}
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
