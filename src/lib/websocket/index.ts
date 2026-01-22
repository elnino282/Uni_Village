/**
 * WebSocket Module Exports
 *
 * @deprecated This module is deprecated. Chat features now use Firebase RTDB.
 * These exports are kept for backward compatibility during the migration period.
 * TODO: Remove after full migration verification.
 */

export { stompClient } from "./stompClient";
export type {
    AckEvent,
    AckStatus,
    ChatMessageEvent,
    ChatSendPayload,
    ConversationUpgradedEvent,
    MessageEvent,
    ParticipantStatus,
    ReadReceiptEvent,
    StompSubscription,
    TypingEvent,
    UpgradeReason,
    WebSocketConfig,
    WebSocketEventType,
    WebSocketMessage,
    WebSocketTopic
} from "./types";
export { WebSocketService, websocketService } from "./websocketService";

