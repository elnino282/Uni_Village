/**
 * ChatThreadScreen Component
 * Main chat thread screen composition - supports both DM and Group chats
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import BottomSheet from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import type { Itinerary } from "@/features/itinerary/types/itinerary.types";
import { getItineraryCoverImage } from "@/features/itinerary/types/itinerary.types";
import { EmptyState } from "@/shared/components/feedback";
import { Colors } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";

// Import i18n config
import "@/lib/i18n";

import { queryKeys } from "@/config/queryKeys";
import { useAuthStore } from "@/features/auth/store/authStore";
import { websocketService } from "@/lib/websocket";
import type { MessageResponse } from "@/shared/types/backend.types";
import { MessageType } from "@/shared/types/backend.types";
import type { Slice } from "@/shared/types/pagination.types";
import { useQueryClient } from "@tanstack/react-query";
import {
    useMessages,
    useSendMessageHybrid,
    useSendSharedCard,
    useThread,
} from "../hooks";
import { isVirtualThreadId } from "../services";
import type { ChatThread, GroupThread, ImageMessage, Message, SystemMessage, TextMessage, UserPreview } from "../types";
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
 * Complete interface matching backend MediaAttachmentResponse
 */
interface AttachmentResponse {
  id: number;
  messageId: number;
  fileId: number;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

/**
 * Map API MessageResponse to local Message type
 */
function mapMessageResponse(msg: MessageResponse, currentUserId?: number): Message {
  const isSentByMe = currentUserId ? msg.senderId === currentUserId : false;
  const time = msg.timestamp ? new Date(msg.timestamp) : new Date();
  const timeLabel = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const optimisticMsg = msg as any;
  const status = optimisticMsg._status || 'sent';

  const messageId = typeof msg.id === 'number' ? msg.id : undefined;
  const conversationId = msg.conversationId;
  const isUnsent = msg.isActive === false;

  // Handle SYSTEM messages
  if (msg.messageType === MessageType.SYSTEM) {
    return {
      id: String(msg.id ?? Date.now()),
      type: 'system' as const,
      text: msg.content ?? '',
      sender: 'system',
      createdAt: msg.timestamp ?? new Date().toISOString(),
      timeLabel,
      status,
      messageId,
      conversationId,
      isUnsent,
    } satisfies SystemMessage;
  }

  if (msg.messageType === MessageType.IMAGE) {
    // Read from attachments array (backend MediaAttachmentResponse structure)
    const attachments = (msg as { attachments?: AttachmentResponse[] }).attachments;
    const imageUrl = attachments?.[0]?.fileUrl;

    // Graceful fallback when image URL missing
    if (!imageUrl) {
      console.warn(`[Chat] Message ${msg.id} has IMAGE type but missing fileUrl`);
      return {
        id: String(msg.id ?? Date.now()),
        type: 'text' as const,
        text: '📷 [Image unavailable]',
        sender: isSentByMe ? 'me' : 'other',
        createdAt: msg.timestamp ?? new Date().toISOString(),
        timeLabel,
        status,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatarUrl,
        messageId,
        conversationId,
        isUnsent,
      } satisfies TextMessage;
    }

    return {
      id: String(msg.id ?? Date.now()),
      type: 'image' as const,
      imageUrl,
      caption: msg.content,
      sender: isSentByMe ? 'me' : 'other',
      createdAt: msg.timestamp ?? new Date().toISOString(),
      timeLabel,
      status,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatarUrl,
      messageId,
      conversationId,
      isUnsent,
    } satisfies ImageMessage;
  }

  return {
    id: String(msg.id ?? Date.now()),
    type: 'text' as const,
    text: isUnsent ? 'Tin nhắn đã bị thu hồi' : (msg.content ?? ''),
    sender: isSentByMe ? 'me' : 'other',
    createdAt: msg.timestamp ?? new Date().toISOString(),
    timeLabel,
    status,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatarUrl,
    messageId,
    conversationId,
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
  const { sendMessage: sendMessageHybrid, sendImage, canSend } = useSendMessageHybrid();
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
  const otherUserId = dmThread?.peer ? Number(dmThread.peer.id) : null;
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

      // Handle sending attachments
      if (attachments.length > 0) {
        // Create a promise array for all image uploads
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
            text, // Pass caption if provided
          );
        });

        // Execute all promises
        try {
          await Promise.all(uploadPromises);
          setAttachments([]); // Clear attachments after sending
        } catch (error) {
          console.error('[ChatThread] Failed to send one or more images:', error);
          Alert.alert("Error", "Failed to send one or more images");
        }
      } else {
        // Handle sending text message
        try {
          const message = await sendMessageHybrid({
            threadId,
            text,
            recipientId: otherUserId ?? undefined,
            senderInfo: {
              id: user.id,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
          });

          // If we were on a virtual thread and created a real conversation, redirect to it
          // This ensures WebSocket events (which use the real ID) are received correctly
          if (isVirtualThreadId(threadId) && message.conversationId && message.conversationId !== threadId) {
            console.log(`[ChatThread] Redirecting from virtual thread ${threadId} to ${message.conversationId}`);
            routerInstance.replace(`/chat/${message.conversationId}`);
          }
        } catch (error) {
          console.error('[ChatThread] Failed to send message:', error);
        }
      }
    },
    [sendMessageHybrid, threadId, attachments, sendImage]
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
      console.error("Failed to pick image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  }, []);

  const handleRemoveAttachment = useCallback((uri: string) => {
    setAttachments(prev => prev.filter(a => a.uri !== uri));
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
    // For group threads (channels), navigate to channel info
    if (isGroup) {
      router.push(`/channel/${threadId}/info`);
    } else {
      router.push(`/chat/${threadId}/info`);
    }
  }, [threadId, isGroup]);

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

  // Subscribe to conversation-specific WebSocket events
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!threadId || isVirtualThreadId(threadId)) return;

    const subscription = websocketService.subscribeToMessages(
      threadId,
      (message) => {
        console.log('[ChatThread] WS event:', message.eventType);
        const eventData = message.data as any;

        if (message.eventType === 'SEND') {
          // New message received
          const newMessage = eventData.message as MessageResponse;
          if (!newMessage) return;

          const queryKey = queryKeys.messages.list(threadId, {});
          queryClient.setQueryData<{ pages: Slice<MessageResponse>[] }>(queryKey, (oldData) => {
            if (!oldData?.pages?.length) return oldData;

            // Avoid duplicates (if we already have it from global subscription or optimistic)
            const exists = oldData.pages[0]?.content.some(msg => msg.id === newMessage.id);
            if (exists) return oldData;

            const newPages = [...oldData.pages];
            newPages[0] = {
              ...newPages[0],
              content: [newMessage, ...newPages[0].content],
              numberOfElements: newPages[0].numberOfElements + 1,
            };

            return { ...oldData, pages: newPages };
          });

        } else if (message.eventType === 'EDIT') {
          // Update edited message in cache
          const queryKey = queryKeys.messages.list(threadId, {});
          queryClient.setQueryData<{ pages: Slice<MessageResponse>[] }>(queryKey, (oldData) => {
            if (!oldData?.pages?.length) return oldData;

            const editedMessage = eventData.message as MessageResponse;
            if (!editedMessage) return oldData;

            const newPages = oldData.pages.map((page) => ({
              ...page,
              content: page.content.map((msg) =>
                msg.id === editedMessage.id ? editedMessage : msg
              ),
            }));

            return { ...oldData, pages: newPages };
          });
        } else if (message.eventType === 'UNSEND') {
          // Mark message as deleted in cache
          const queryKey = queryKeys.messages.list(threadId, {});
          queryClient.setQueryData<{ pages: Slice<MessageResponse>[] }>(queryKey, (oldData) => {
            if (!oldData?.pages?.length) return oldData;

            // UNSEND event might have message object or just messageId
            // Check structure based on types.ts, but fallback to any
            const messageId = eventData.message?.id || eventData.messageId;

            if (!messageId) return oldData;

            const newPages = oldData.pages.map((page) => ({
              ...page,
              content: page.content.map((msg) =>
                msg.id === messageId ? { ...msg, isActive: false, content: 'Tin nhắn đã bị thu hồi' } : msg
              ),
            }));

            return { ...oldData, pages: newPages };
          });
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [threadId, queryClient]);

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
          isSending={false}
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
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
          channelId={groupThread.channelId}
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
