/**
 * ChatThreadScreen Component
 * Main chat thread screen composition - supports both DM and Group chats
 * Matches Figma node 317:2269 (DM) and 317:2919 (Group)
 */
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import type { Itinerary } from "@/features/itinerary/types/itinerary.types";
import { getItineraryCoverImage } from "@/features/itinerary/types/itinerary.types";
import { EmptyState } from "@/shared/components/feedback";
import { Colors } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";

// Import i18n config
import "@/lib/i18n";

import {
  useMessages,
  useSendMessage,
  useSendSharedCard,
  useThread,
} from "../hooks";
import type { GroupThread, UserPreview } from "../types";
import { isGroupThread } from "../types";
import { AddMemberBottomSheet, type AddMemberBottomSheetRef } from "./AddMemberBottomSheet";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { GroupChatHeader } from "./GroupChatHeader";
import { ItineraryShareSheet } from "./ItineraryShareSheet";
import { MessageList } from "./MessageList";
import { PinnedMessageBar } from "./PinnedMessageBar";

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

  // Data fetching
  const { data: thread, isLoading: isLoadingThread } = useThread(threadId);
  const { data: messages = [], isLoading: isLoadingMessages } =
    useMessages(threadId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: sendSharedCard } = useSendSharedCard();

  // Determine if group chat
  const isGroup = thread ? isGroupThread(thread) : false;
  const groupThread = isGroup ? (thread as GroupThread) : null;

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
