/**
 * Chat feature types
 * Types for chat threads, messages, and shared content
 */

/**
 * Message sender type
 */
export type MessageSender = 'me' | 'other';

/**
 * Message type discriminator
 */
export type MessageType = 'text' | 'sharedCard';

/**
 * Message delivery status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

/**
 * Base message interface
 */
interface BaseMessage {
  id: string;
  sender: MessageSender;
  createdAt: string;
  /** Formatted time label: "10:30", "10:31" */
  timeLabel: string;
  status?: MessageStatus;
}

/**
 * Text message
 */
export interface TextMessage extends BaseMessage {
  type: 'text';
  text: string;
}

/**
 * Shared content card (e.g., itinerary)
 */
export interface SharedCard {
  id: string;
  title: string;
  imageUrl: string;
  ctaText: string;
  /** Route to navigate when tapped */
  route: string;
}

/**
 * Shared card message
 */
export interface SharedCardMessage extends BaseMessage {
  type: 'sharedCard';
  card: SharedCard;
}

/**
 * Union type for all message types
 */
export type Message = TextMessage | SharedCardMessage;

/**
 * Chat thread peer information
 */
export interface ThreadPeer {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

/**
 * Online status for a peer
 */
export type OnlineStatus = 'online' | 'offline' | 'away';

/**
 * Chat thread metadata
 */
export interface ChatThread {
  id: string;
  peer: ThreadPeer;
  onlineStatus: OnlineStatus;
  /** Localized online status text: "Đang hoạt động", "Offline", etc. */
  onlineStatusText: string;
}

/**
 * Response type for fetching thread info
 */
export interface ThreadResponse {
  thread: ChatThread;
}

/**
 * Response type for fetching messages
 */
export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

/**
 * Input for sending a new message
 */
export interface SendMessageInput {
  threadId: string;
  text: string;
}
