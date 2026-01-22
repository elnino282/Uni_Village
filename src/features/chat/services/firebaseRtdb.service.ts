/**
 * Firebase Realtime Database Chat Service
 * Real-time chat using Firebase RTDB as the single source of truth
 *
 * Data Model:
 * - conversations/{conversationId}: { members, lastMessage, lastMessageAt, type, name? }
 * - messages/{conversationId}/{messageId}: { senderId, text, createdAt, type, ... }
 * - userConversations/{uid}/{conversationId}: true
 * - status/{uid}: { state, lastChanged }
 * - typing/{conversationId}/{uid}: true | null
 */

import {
  get,
  limitToLast,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";

import { auth, database } from "@/lib/firebase";
import type { MessageType, SharedCard } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface RtdbConversationMember {
  displayName: string;
  avatarUrl?: string;
  legacyUserId?: number;
  joinedAt: number;
}

export interface RtdbConversation {
  id: string;
  type: "dm" | "group";
  members: Record<string, true>;
  memberDetails?: Record<string, RtdbConversationMember>;
  name?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: number;
  lastMessageType?: MessageType;
  lastMessageSenderId?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface RtdbMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatarUrl?: string;
  legacySenderId?: number;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  card?: SharedCard;
  createdAt: number;
  updatedAt?: number;
  isActive: boolean;
  clientMessageId?: string;
}

export interface RtdbMessageInput {
  text?: string;
  type: MessageType;
  imageUrl?: string;
  card?: SharedCard;
  clientMessageId?: string;
}

export interface RtdbUserStatus {
  state: "online" | "offline";
  lastChanged: number;
}

export interface RtdbTypingUser {
  uid: string;
  displayName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface ConversationParticipant {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  legacyUserId?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

function isRetryableError(error: any): boolean {
  if (!error) return false;
  const code = error.code || error.message || "";
  const codeStr = String(code).toLowerCase();
  return (
    codeStr.includes("network") ||
    codeStr.includes("unavailable") ||
    codeStr.includes("timeout") ||
    codeStr.includes("disconnected") ||
    code === "unavailable" ||
    code === "network_error"
  );
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: any;
  let delay = INITIAL_RETRY_DELAY;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        console.error(
          `[RTDB] ${operationName} failed after ${attempt + 1} attempts:`,
          error,
        );
        throw error;
      }

      console.warn(
        `[RTDB] ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
        error.message || error,
      );

      await sleep(delay);
      delay = Math.min(delay * 2, MAX_RETRY_DELAY);
    }
  }

  throw lastError;
}

function validateConversationId(conversationId: string): void {
  if (!conversationId || typeof conversationId !== "string") {
    throw new Error("Invalid conversation ID");
  }
  if (conversationId.length > 256) {
    throw new Error("Conversation ID too long");
  }
}

function validateMessageInput(input: RtdbMessageInput): void {
  if (!input.type) {
    throw new Error("Message type is required");
  }

  const validTypes = ["text", "image", "sharedCard"];
  if (!validTypes.includes(input.type)) {
    throw new Error(`Invalid message type: ${input.type}`);
  }

  if (input.type === "text") {
    if (input.text && input.text.length > 10000) {
      throw new Error("Message text too long (max 10000 characters)");
    }
  }

  if (input.type === "image" && !input.imageUrl) {
    throw new Error("Image URL is required for image messages");
  }

  if (input.type === "sharedCard" && !input.card) {
    throw new Error("Card data is required for shared card messages");
  }
}

function validateParticipant(participant: ConversationParticipant): void {
  if (!participant.uid || typeof participant.uid !== "string") {
    throw new Error("Participant UID is required");
  }
  if (!participant.displayName || typeof participant.displayName !== "string") {
    throw new Error("Participant display name is required");
  }
  if (participant.displayName.length > 100) {
    throw new Error("Display name too long (max 100 characters)");
  }
}

/**
 * Get the current authenticated user's UID
 * Throws if not authenticated
 */
function getCurrentUid(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.uid;
}

/**
 * Build a deterministic conversation ID for DMs
 * Sorts UIDs alphabetically to ensure consistency
 */
export function buildDmConversationId(uidA: string, uidB: string): string {
  const sorted = [uidA, uidB].sort();
  return `dm_${sorted[0]}_${sorted[1]}`;
}

/**
 * Check if a thread ID is a virtual (not yet created) conversation
 */
export function isVirtualThreadId(threadId: string): boolean {
  return threadId.startsWith("user-") || threadId.startsWith("virtual_");
}// ============================================================================
// Conversations
// ============================================================================

/**
 * Get a single conversation by ID
 */
export async function getConversation(
  conversationId: string,
): Promise<RtdbConversation | null> {
  validateConversationId(conversationId);

  return retryWithBackoff(async () => {
    const conversationRef = ref(database, `conversations/${conversationId}`);
    const snapshot = await get(conversationRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: conversationId,
      ...snapshot.val(),
    };
  }, `getConversation(${conversationId})`);
}

/**
 * Ensure a conversation exists with the expected members and metadata.
 * Safe to call repeatedly; only missing members/details are added.
 */
export async function ensureConversation(
  conversationId: string,
  data: {
    type: "dm" | "group";
    members: ConversationParticipant[];
    name?: string;
    avatarUrl?: string;
  },
): Promise<void> {
  validateConversationId(conversationId);

  if (!data.type || (data.type !== "dm" && data.type !== "group")) {
    throw new Error("Invalid conversation type");
  }

  if (!data.members || data.members.length === 0) {
    throw new Error("At least one member is required");
  }

  for (const member of data.members) {
    validateParticipant(member);
  }

  if (data.name && data.name.length > 100) {
    throw new Error("Conversation name too long (max 100 characters)");
  }

  return retryWithBackoff(async () => {
    const conversationRef = ref(database, `conversations/${conversationId}`);
    const snapshot = await get(conversationRef);
    const now = Date.now();

    const membersMap: Record<string, true> = {};
    const memberDetails: Record<string, RtdbConversationMember> = {};

    for (const member of data.members) {
      if (!member.uid) continue;
      membersMap[member.uid] = true;
      memberDetails[member.uid] = {
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        legacyUserId: member.legacyUserId,
        joinedAt: now,
      };
    }

    const updates: Record<string, any> = {};

    if (!snapshot.exists()) {
      const conversationData: Omit<RtdbConversation, "id"> = {
        type: data.type,
        members: membersMap,
        memberDetails,
        name: data.name,
        avatarUrl: data.avatarUrl,
        createdAt: now,
        updatedAt: now,
      };
      updates[`conversations/${conversationId}`] = conversationData;
    } else {
      const existing = snapshot.val() as Partial<RtdbConversation>;
      const existingMembers = existing.members ?? {};

      for (const member of data.members) {
        if (!member.uid) continue;
        if (!existingMembers[member.uid]) {
          updates[`conversations/${conversationId}/members/${member.uid}`] = true;
          updates[`conversations/${conversationId}/memberDetails/${member.uid}`] =
            memberDetails[member.uid];
        } else if (!existing.memberDetails?.[member.uid]) {
          updates[`conversations/${conversationId}/memberDetails/${member.uid}`] =
            memberDetails[member.uid];
        }
      }

      if (!existing.type && data.type) {
        updates[`conversations/${conversationId}/type`] = data.type;
      }
      if (!existing.name && data.name) {
        updates[`conversations/${conversationId}/name`] = data.name;
      }
      if (!existing.avatarUrl && data.avatarUrl) {
        updates[`conversations/${conversationId}/avatarUrl`] = data.avatarUrl;
      }

      if (Object.keys(updates).length > 0) {
        updates[`conversations/${conversationId}/updatedAt`] = now;
      }
    }

    for (const member of data.members) {
      if (!member.uid) continue;
      updates[`userConversations/${member.uid}/${conversationId}`] = true;
    }

    if (Object.keys(updates).length > 0) {
      try {
        await update(ref(database), updates);
      } catch (error: any) {
        if (error.code === "permission-denied") {
          const recheck = await get(conversationRef);
          if (recheck.exists()) {
            const existing = recheck.val() as Partial<RtdbConversation>;
            const hasAllMembers = data.members.every(
              (m) => m.uid && existing.members?.[m.uid],
            );
            if (hasAllMembers) {
              return;
            }
          }
        }
        throw error;
      }
    }
  }, `ensureConversation(${conversationId})`);
}

/**
 * Create or get an existing DM conversation between two users
 * Handles race conditions by checking existence again after retry
 */
export async function ensureDirectConversation(
  currentUser: ConversationParticipant,
  peer: ConversationParticipant,
): Promise<string> {
  validateParticipant(currentUser);
  validateParticipant(peer);

  if (currentUser.uid === peer.uid) {
    throw new Error("Cannot create DM conversation with yourself");
  }

  const conversationId = buildDmConversationId(currentUser.uid, peer.uid);

  try {
    return await retryWithBackoff(async () => {
      const conversationRef = ref(database, `conversations/${conversationId}`);
      const snapshot = await get(conversationRef);

      if (snapshot.exists()) {
        const existing = snapshot.val() as Partial<RtdbConversation>;
        if (existing.members?.[currentUser.uid] && existing.members?.[peer.uid]) {
          return conversationId;
        }
      }

      const now = Date.now();

      const conversationData: Omit<RtdbConversation, "id"> = {
        type: "dm",
        members: {
          [currentUser.uid]: true,
          [peer.uid]: true,
        },
        memberDetails: {
          [currentUser.uid]: {
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
            legacyUserId: currentUser.legacyUserId,
            joinedAt: now,
          },
          [peer.uid]: {
            displayName: peer.displayName,
            avatarUrl: peer.avatarUrl,
            legacyUserId: peer.legacyUserId,
            joinedAt: now,
          },
        },
        createdAt: now,
        updatedAt: now,
      };

      const updates: Record<string, any> = {};
      updates[`conversations/${conversationId}`] = conversationData;
      updates[`userConversations/${currentUser.uid}/${conversationId}`] = true;
      updates[`userConversations/${peer.uid}/${conversationId}`] = true;

      await update(ref(database), updates);

      return conversationId;
    }, `ensureDirectConversation(${conversationId})`);
  } catch (error: any) {
    if (error.code === "permission-denied" || error.message?.includes("permission")) {
      const existing = await getConversation(conversationId);
      if (existing && existing.members[currentUser.uid] && existing.members[peer.uid]) {
        return conversationId;
      }
    }
    throw error;
  }
}

/**
 * Create a group conversation
 */
export async function createGroupConversation(
  name: string,
  participants: ConversationParticipant[],
  avatarUrl?: string,
): Promise<string> {
  getCurrentUid(); // Verify user is authenticated
  const conversationRef = push(ref(database, "conversations"));
  const conversationId = conversationRef.key!;
  const now = Date.now();

  // Build members and memberDetails
  const members: Record<string, true> = {};
  const memberDetails: Record<string, RtdbConversationMember> = {};

  for (const p of participants) {
    members[p.uid] = true;
    memberDetails[p.uid] = {
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      legacyUserId: p.legacyUserId,
      joinedAt: now,
    };
  }

  const conversationData: Omit<RtdbConversation, "id"> = {
    type: "group",
    name,
    avatarUrl,
    members,
    memberDetails,
    createdAt: now,
    updatedAt: now,
  };

  // Multi-path update for atomicity
  const updates: Record<string, any> = {};
  updates[`conversations/${conversationId}`] = conversationData;

  for (const uid of Object.keys(members)) {
    updates[`userConversations/${uid}/${conversationId}`] = true;
  }

  await update(ref(database), updates);

  return conversationId;
}

/**
 * Subscribe to a user's conversation list
 * Returns conversation metadata for each conversation the user is a member of
 */
export function subscribeToConversationList(
  uid: string,
  onConversationsChange: (conversations: RtdbConversation[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const userConversationsRef = ref(database, `userConversations/${uid}`);
  const conversationRefs: Map<string, Unsubscribe> = new Map();
  const conversations: Map<string, RtdbConversation> = new Map();

  // Emit sorted conversations
  const emitConversations = () => {
    const sorted = Array.from(conversations.values()).sort((a, b) => {
      const aTime = a.lastMessageAt ?? a.createdAt ?? 0;
      const bTime = b.lastMessageAt ?? b.createdAt ?? 0;
      return bTime - aTime; // Most recent first
    });
    onConversationsChange(sorted);
  };

  // Subscribe to individual conversation metadata
  const subscribeToConversation = (conversationId: string) => {
    if (conversationRefs.has(conversationId)) return;

    const convRef = ref(database, `conversations/${conversationId}`);
    const unsubscribe = onValue(
      convRef,
      (snapshot) => {
        if (snapshot.exists()) {
          conversations.set(conversationId, {
            id: conversationId,
            ...snapshot.val(),
          });
        } else {
          conversations.delete(conversationId);
        }
        emitConversations();
      },
      (error) => {
        console.error(
          `[RTDB] Error subscribing to conversation ${conversationId}:`,
          error,
        );
        onError?.(error as Error);
      },
    );

    conversationRefs.set(conversationId, unsubscribe);
  };

  // Unsubscribe from a conversation
  const unsubscribeFromConversation = (conversationId: string) => {
    const unsubscribe = conversationRefs.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      conversationRefs.delete(conversationId);
      conversations.delete(conversationId);
    }
  };

  // Watch for conversation additions
  const addedUnsubscribe = onChildAdded(userConversationsRef, (snapshot) => {
    const conversationId = snapshot.key;
    if (conversationId) {
      subscribeToConversation(conversationId);
    }
  });

  // Watch for conversation removals
  const removedUnsubscribe = onChildRemoved(
    userConversationsRef,
    (snapshot) => {
      const conversationId = snapshot.key;
      if (conversationId) {
        unsubscribeFromConversation(conversationId);
        emitConversations();
      }
    },
  );

  // Return cleanup function
  return () => {
    addedUnsubscribe();
    removedUnsubscribe();
    conversationRefs.forEach((unsub) => unsub());
    conversationRefs.clear();
    conversations.clear();
  };
}

// ============================================================================
// Messages
// ============================================================================

/**
 * Subscribe to messages in a conversation with real-time updates
 * Uses onChildAdded for efficient incremental updates
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: RtdbMessage) => void,
  onError?: (error: Error) => void,
  limit: number = 50,
): Unsubscribe {
  const messagesRef = ref(database, `messages/${conversationId}`);
  const messagesQuery = query(
    messagesRef,
    orderByChild("createdAt"),
    limitToLast(limit),
  );

  const unsubscribe = onChildAdded(
    messagesQuery,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onMessage({
          id: snapshot.key!,
          conversationId,
          ...data,
        });
      }
    },
    (error) => {
      console.error(`[RTDB] Error subscribing to messages:`, error);
      onError?.(error as Error);
    },
  );

  return unsubscribe;
}

/**
 * Subscribe to all messages (including updates and deletions)
 * Returns array of messages, sorted by createdAt ascending
 */
export function subscribeToMessagesSnapshot(
  conversationId: string,
  onMessages: (messages: RtdbMessage[]) => void,
  onError?: (error: Error) => void,
  limit: number = 50,
): Unsubscribe {
  const messagesRef = ref(database, `messages/${conversationId}`);
  const messagesQuery = query(
    messagesRef,
    orderByChild("createdAt"),
    limitToLast(limit),
  );

  const unsubscribe = onValue(
    messagesQuery,
    (snapshot) => {
      const messages: RtdbMessage[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data) {
          messages.push({
            id: childSnapshot.key!,
            conversationId,
            ...data,
          });
        }
      });
      // Sort ascending by createdAt
      messages.sort((a, b) => a.createdAt - b.createdAt);
      onMessages(messages);
    },
    (error) => {
      console.error(`[RTDB] Error subscribing to messages snapshot:`, error);
      onError?.(error as Error);
    },
  );

  return unsubscribe;
}

/**
 * Send a message to a conversation
 * Atomically updates messages, conversation lastMessage, and userConversations
 */
export async function sendMessage(
  conversationId: string,
  input: RtdbMessageInput,
  senderInfo?: {
    displayName?: string;
    avatarUrl?: string;
    legacyUserId?: number;
  },
): Promise<RtdbMessage> {
  validateConversationId(conversationId);
  validateMessageInput(input);

  const senderId = getCurrentUid();
  const user = auth.currentUser;
  const now = Date.now();

  return retryWithBackoff(async () => {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.members[senderId]) {
      throw new Error("User is not a member of this conversation");
    }

    const messageRef = push(ref(database, `messages/${conversationId}`));
    const messageId = messageRef.key!;

    const messageData = {
      senderId,
      senderName: senderInfo?.displayName ?? user?.displayName ?? "Unknown",
      senderAvatarUrl: senderInfo?.avatarUrl ?? user?.photoURL ?? undefined,
      legacySenderId: senderInfo?.legacyUserId,
      type: input.type,
      text: input.text,
      imageUrl: input.imageUrl,
      card: input.card,
      createdAt: now,
      isActive: true,
      clientMessageId: input.clientMessageId,
    };

    Object.keys(messageData).forEach((key) => {
      if (messageData[key as keyof typeof messageData] === undefined) {
        delete messageData[key as keyof typeof messageData];
      }
    });

    let lastMessagePreview = "";
    if (input.type === "text") {
      lastMessagePreview = input.text?.substring(0, 100) ?? "";
    } else if (input.type === "image") {
      lastMessagePreview = "[Image]";
    } else if (input.type === "sharedCard") {
      lastMessagePreview = input.card?.title ?? "[Shared Card]";
    }

    const updates: Record<string, any> = {};
    updates[`messages/${conversationId}/${messageId}`] = messageData;
    updates[`conversations/${conversationId}/lastMessage`] = lastMessagePreview;
    updates[`conversations/${conversationId}/lastMessageAt`] = now;
    updates[`conversations/${conversationId}/lastMessageType`] = input.type;
    updates[`conversations/${conversationId}/lastMessageSenderId`] = senderId;
    updates[`conversations/${conversationId}/updatedAt`] = now;

    for (const memberUid of Object.keys(conversation.members)) {
      updates[`userConversations/${memberUid}/${conversationId}`] = true;
    }

    try {
      await update(ref(database), updates);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        const recheck = await getConversation(conversationId);
        if (!recheck || !recheck.members[senderId]) {
          throw new Error("User is not a member of this conversation");
        }
        throw new Error("Failed to send message: permission denied");
      }
      throw error;
    }

    return {
      id: messageId,
      conversationId,
      ...messageData,
    } as RtdbMessage;
  }, `sendMessage(${conversationId})`);
}

/**
 * Send a text message (convenience wrapper)
 */
export async function sendTextMessage(
  conversationId: string,
  text: string,
  senderInfo?: {
    displayName?: string;
    avatarUrl?: string;
    legacyUserId?: number;
  },
  clientMessageId?: string,
): Promise<RtdbMessage> {
  return sendMessage(
    conversationId,
    {
      type: "text",
      text,
      clientMessageId,
    },
    senderInfo,
  );
}

/**
 * Send an image message
 */
export async function sendImageMessage(
  conversationId: string,
  imageUrl: string,
  caption?: string,
  senderInfo?: {
    displayName?: string;
    avatarUrl?: string;
    legacyUserId?: number;
  },
): Promise<RtdbMessage> {
  return sendMessage(
    conversationId,
    {
      type: "image",
      imageUrl,
      text: caption,
    },
    senderInfo,
  );
}

/**
 * Send a shared card message
 */
export async function sendSharedCardMessage(
  conversationId: string,
  card: SharedCard,
  senderInfo?: {
    displayName?: string;
    avatarUrl?: string;
    legacyUserId?: number;
  },
): Promise<RtdbMessage> {
  return sendMessage(
    conversationId,
    {
      type: "sharedCard",
      card,
    },
    senderInfo,
  );
}

/**
 * Soft delete (unsend) a message
 */
export async function unsendMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  validateConversationId(conversationId);

  if (!messageId || typeof messageId !== "string") {
    throw new Error("Invalid message ID");
  }

  const senderId = getCurrentUid();

  return retryWithBackoff(async () => {
    const messageRef = ref(database, `messages/${conversationId}/${messageId}`);

    const snapshot = await get(messageRef);
    if (!snapshot.exists()) {
      throw new Error("Message not found");
    }

    const message = snapshot.val();
    if (message.senderId !== senderId) {
      throw new Error("Cannot unsend a message you did not send");
    }

    await update(messageRef, {
      isActive: false,
      text: null,
      imageUrl: null,
      card: null,
      updatedAt: Date.now(),
    });
  }, `unsendMessage(${conversationId}, ${messageId})`);
}

// ============================================================================
// Presence
// ============================================================================

/**
 * Initialize presence for the current user
 * Sets up online/offline status with onDisconnect handler
 */
export function initializePresence(): Unsubscribe {
  const uid = getCurrentUid();
  const statusRef = ref(database, `status/${uid}`);
  const connectedRef = ref(database, ".info/connected");

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      // We're connected - set online status
      set(statusRef, {
        state: "online",
        lastChanged: Date.now(),
      });

      // Set up onDisconnect to mark offline
      onDisconnect(statusRef).set({
        state: "offline",
        lastChanged: Date.now(),
      });
    }
  });

  return unsubscribe;
}

/**
 * Subscribe to a user's online status
 */
export function subscribeToUserStatus(
  uid: string,
  onStatusChange: (status: RtdbUserStatus | null) => void,
): Unsubscribe {
  const statusRef = ref(database, `status/${uid}`);

  const unsubscribe = onValue(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      onStatusChange(snapshot.val());
    } else {
      onStatusChange(null);
    }
  });

  return unsubscribe;
}

/**
 * Manually set user status (e.g., when going to background)
 */
export async function setUserStatus(
  state: "online" | "offline",
): Promise<void> {
  const uid = getCurrentUid();
  const statusRef = ref(database, `status/${uid}`);

  await set(statusRef, {
    state,
    lastChanged: Date.now(),
  });
}

// ============================================================================
// Typing Indicators
// ============================================================================

/**
 * Set typing status for current user in a conversation
 */
export async function setTyping(
  conversationId: string,
  isTyping: boolean,
  displayName?: string,
): Promise<void> {
  const uid = getCurrentUid();
  const typingRef = ref(database, `typing/${conversationId}/${uid}`);

  if (isTyping) {
    await set(typingRef, {
      displayName: displayName ?? auth.currentUser?.displayName ?? "Unknown",
      isTyping: true,
      timestamp: Date.now(),
    });
  } else {
    await remove(typingRef);
  }
}

/**
 * Subscribe to typing indicators in a conversation
 */
export function subscribeToTyping(
  conversationId: string,
  onTypingChange: (typingUsers: RtdbTypingUser[]) => void,
): Unsubscribe {
  const typingRef = ref(database, `typing/${conversationId}`);

  const unsubscribe = onValue(typingRef, (snapshot) => {
    const typingUsers: RtdbTypingUser[] = [];

    snapshot.forEach((childSnapshot) => {
      const uid = childSnapshot.key!;
      const data = childSnapshot.val();

      // Filter out stale typing indicators (older than 10 seconds)
      if (data && data.isTyping && Date.now() - data.timestamp < 10000) {
        typingUsers.push({
          uid,
          displayName: data.displayName ?? "Unknown",
          isTyping: true,
          timestamp: data.timestamp,
        });
      }
    });

    onTypingChange(typingUsers);
  });

  return unsubscribe;
}

// ============================================================================
// Utility
// ============================================================================

/**
 * Leave a conversation (remove from userConversations)
 */
export async function leaveConversation(conversationId: string): Promise<void> {
  validateConversationId(conversationId);
  const uid = getCurrentUid();

  return retryWithBackoff(async () => {
    const updates: Record<string, any> = {};
    updates[`userConversations/${uid}/${conversationId}`] = null;
    updates[`conversations/${conversationId}/members/${uid}`] = null;
    updates[`conversations/${conversationId}/memberDetails/${uid}`] = null;

    await update(ref(database), updates);
  }, `leaveConversation(${conversationId})`);
}

/**
 * Add members to a group conversation
 */
export async function addMembersToConversation(
  conversationId: string,
  members: ConversationParticipant[],
): Promise<void> {
  validateConversationId(conversationId);

  if (!members || members.length === 0) {
    throw new Error("At least one member is required");
  }

  for (const member of members) {
    validateParticipant(member);
  }

  return retryWithBackoff(async () => {
    const now = Date.now();
    const updates: Record<string, any> = {};

    for (const member of members) {
      updates[`conversations/${conversationId}/members/${member.uid}`] = true;
      updates[`conversations/${conversationId}/memberDetails/${member.uid}`] = {
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        legacyUserId: member.legacyUserId,
        joinedAt: now,
      };
      updates[`userConversations/${member.uid}/${conversationId}`] = true;
    }

    updates[`conversations/${conversationId}/updatedAt`] = now;

    await update(ref(database), updates);
  }, `addMembersToConversation(${conversationId})`);
}

/**
 * Update conversation metadata (name, avatar)
 */
export async function updateConversationMetadata(
  conversationId: string,
  data: { name?: string; avatarUrl?: string },
): Promise<void> {
  const updates: Record<string, any> = {};

  if (data.name !== undefined) {
    updates[`conversations/${conversationId}/name`] = data.name;
  }
  if (data.avatarUrl !== undefined) {
    updates[`conversations/${conversationId}/avatarUrl`] = data.avatarUrl;
  }
  updates[`conversations/${conversationId}/updatedAt`] = Date.now();

  await update(ref(database), updates);
}

export default {
  // Conversations
  getConversation,
  ensureConversation,
  ensureDirectConversation,
  createGroupConversation,
  subscribeToConversationList,
  leaveConversation,
  addMembersToConversation,
  updateConversationMetadata,

  // Messages
  subscribeToMessages,
  subscribeToMessagesSnapshot,
  sendMessage,
  sendTextMessage,
  sendImageMessage,
  sendSharedCardMessage,
  unsendMessage,

  // Presence
  initializePresence,
  subscribeToUserStatus,
  setUserStatus,

  // Typing
  setTyping,
  subscribeToTyping,

  // Utility
  buildDmConversationId,
  isVirtualThreadId,
};

