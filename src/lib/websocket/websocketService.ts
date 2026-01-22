import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useChatStore } from "@/features/chat/store/chatStore";
import { AppState, AppStateStatus } from "react-native";
import { stompClient } from "./stompClient";
import type {
    AckEvent,
    ChatMessageEvent,
    ChatSendPayload,
    ConversationUpgradedEvent,
    MessageEvent,
    StompSubscription,
    TypingEvent,
    WebSocketMessage,
} from "./types";

class WebSocketService {
  private activeSubscriptions: Map<string, StompSubscription> = new Map();
  private appStateSubscription: ReturnType<
    typeof AppState.addEventListener
  > | null = null;
  private shouldReconnect = false;

  /**
   * Initialize AppState listener for background/foreground handling
   * Disconnects WebSocket when app goes to background to save battery
   */
  initAppStateListener(): void {
    if (this.appStateSubscription) {
      return; // Already initialized
    }

    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange.bind(this),
    );
  }

  /**
   * Remove AppState listener
   */
  removeAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === "background" || nextAppState === "inactive") {
      // App going to background - disconnect to save battery
      if (this.isConnected()) {
        console.log("[WebSocket] App going to background, disconnecting...");
        this.shouldReconnect = true;
        this.disconnect();
      }
    } else if (nextAppState === "active" && this.shouldReconnect) {
      // App returning to foreground - reconnect if we were connected before
      console.log("[WebSocket] App returning to foreground, reconnecting...");
      this.shouldReconnect = false;
      this.connect().catch((error) => {
        console.error("[WebSocket] Failed to reconnect:", error);
      });
    }
  }

  async connect(): Promise<void> {
    const { accessToken } = useAuthStore.getState();
    const chatStore = useChatStore.getState();

    if (!accessToken) {
      chatStore.setSocketStatus("error", "No access token available");
      throw new Error("No access token available for WebSocket connection");
    }

    // Update status to connecting
    chatStore.setSocketStatus("connecting");

    const wsUrl = env.API_URL.replace("/api", "") + "/ws";

    try {
      await stompClient.connect({
        url: wsUrl,
        accessToken,
        onConnect: () => {
          console.log("[WebSocket] Connected successfully");
          useChatStore.getState().setSocketStatus("connected");
        },
        onDisconnect: () => {
          console.log("[WebSocket] Disconnected");
          this.activeSubscriptions.clear();
          useChatStore.getState().setSocketStatus("disconnected");
        },
        onError: (error) => {
          console.error("[WebSocket] Error:", error);
          useChatStore.getState().setSocketStatus("error", error?.message);
        },
      });

      // Initialize AppState listener on successful connection
      this.initAppStateListener();
    } catch (error) {
      chatStore.setSocketStatus("error", (error as Error)?.message);
      throw error;
    }
  }

  disconnect(): void {
    stompClient.disconnect();
    this.activeSubscriptions.clear();
    useChatStore.getState().setSocketStatus("disconnected");
  }

  /**
   * Subscribe to message events for a conversation
   * Destination: /topic/message.{conversationId}
   */
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: WebSocketMessage<MessageEvent>) => void,
  ): StompSubscription | null {
    const destination = `/topic/message.${conversationId}`;
    const subscription = stompClient.subscribe<MessageEvent>(
      destination,
      onMessage,
    );

    if (subscription) {
      this.activeSubscriptions.set(`message-${conversationId}`, subscription);
    }

    return subscription;
  }

  /**
   * @deprecated Use subscribeToMessages instead
   * Subscribe to conversation events (legacy method for backward compatibility)
   */
  subscribeToConversation(
    conversationId: string,
    onMessage: (message: WebSocketMessage<MessageEvent>) => void,
  ): StompSubscription | null {
    const destination = `/topic/conversation.${conversationId}`;
    const subscription = stompClient.subscribe<MessageEvent>(
      destination,
      onMessage,
    );

    if (subscription) {
      this.activeSubscriptions.set(
        `conversation-${conversationId}`,
        subscription,
      );
    }

    return subscription;
  }

  /**
   * Subscribe to channel update events
   * Destination: /topic/channel.{conversationId}
   */
  subscribeToChannel(
    conversationId: string,
    onMessage: (message: WebSocketMessage<MessageEvent>) => void,
  ): StompSubscription | null {
    const destination = `/topic/channel.${conversationId}`;
    const subscription = stompClient.subscribe<MessageEvent>(
      destination,
      onMessage,
    );

    if (subscription) {
      this.activeSubscriptions.set(`channel-${conversationId}`, subscription);
    }

    return subscription;
  }

  subscribeToUserQueue(
    onMessage: (message: WebSocketMessage<unknown>) => void,
  ): StompSubscription | null {
    const destination = "/user/queue/join-conversation";
    const subscription = stompClient.subscribe(destination, onMessage);

    if (subscription) {
      this.activeSubscriptions.set("user-queue", subscription);
    }

    return subscription;
  }

  subscribeToTyping(
    conversationId: string,
    onTyping: (event: TypingEvent) => void,
  ): StompSubscription | null {
    // Subscribe to the message topic and filter for TYPING events
    const destination = `/topic/message.${conversationId}`;
    const existingKey = `typing-${conversationId}`;

    // Avoid duplicate subscriptions
    if (this.activeSubscriptions.has(existingKey)) {
      return this.activeSubscriptions.get(existingKey) || null;
    }

    const subscription = stompClient.subscribe<TypingEvent>(
      destination,
      (message) => {
        if (message.eventType === "TYPING") {
          onTyping(message.data);
        }
      },
    );

    if (subscription) {
      this.activeSubscriptions.set(existingKey, subscription);
    }

    return subscription;
  }

  sendTypingEvent(conversationId: string, isTyping: boolean): void {
    const { user } = useAuthStore.getState();

    if (!user) return;

    const typingEvent: TypingEvent = {
      userId: Number(user.id),
      userName: user.displayName,
      conversationId,
      isTyping,
    };

    stompClient.send(`/app/typing/${conversationId}`, typingEvent);
  }

  unsubscribeFromConversation(conversationId: string): void {
    // Unsubscribe from all conversation-related subscriptions
    const keys = [
      `conversation-${conversationId}`,
      `message-${conversationId}`,
      `typing-${conversationId}`,
    ];

    keys.forEach((key) => {
      const subscription = this.activeSubscriptions.get(key);
      if (subscription) {
        subscription.unsubscribe();
        this.activeSubscriptions.delete(key);
      }
    });
  }

  unsubscribeAll(): void {
    this.activeSubscriptions.forEach((sub) => sub.unsubscribe());
    this.activeSubscriptions.clear();
  }

  isConnected(): boolean {
    return stompClient.isConnected();
  }

  /**
   * Get list of active subscription keys (for debugging)
   */
  getActiveSubscriptionKeys(): string[] {
    return Array.from(this.activeSubscriptions.keys());
  }

  // ========== User Queue Subscriptions ==========

  /**
   * Subscribe to ACK events for message delivery confirmation
   * Destination: /user/queue/ack
   */
  subscribeToAck(onAck: (ack: AckEvent) => void): StompSubscription | null {
    const destination = "/user/queue/ack";
    const existingKey = "user-ack";

    if (this.activeSubscriptions.has(existingKey)) {
      return this.activeSubscriptions.get(existingKey) || null;
    }

    const subscription = stompClient.subscribe<AckEvent>(
      destination,
      (message) => {
        onAck(message.data);
      },
    );

    if (subscription) {
      this.activeSubscriptions.set(existingKey, subscription);
    }

    return subscription;
  }

  /**
   * Subscribe to incoming chat messages via user queue
   * Destination: /user/queue/messages
   */
  subscribeToIncomingMessages(
    onMessage: (event: ChatMessageEvent) => void,
  ): StompSubscription | null {
    const destination = "/user/queue/messages";
    const existingKey = "user-messages";

    if (this.activeSubscriptions.has(existingKey)) {
      return this.activeSubscriptions.get(existingKey) || null;
    }

    const subscription = stompClient.subscribe<ChatMessageEvent>(
      destination,
      (message) => {
        onMessage(message.data);
      },
    );

    if (subscription) {
      this.activeSubscriptions.set(existingKey, subscription);
    }

    return subscription;
  }

  /**
   * Subscribe to conversation upgrade events
   * Destination: /user/queue/events
   */
  subscribeToConversationEvents(
    onEvent: (event: ConversationUpgradedEvent) => void,
  ): StompSubscription | null {
    const destination = "/user/queue/events";
    const existingKey = "user-events";

    if (this.activeSubscriptions.has(existingKey)) {
      return this.activeSubscriptions.get(existingKey) || null;
    }

    const subscription = stompClient.subscribe<ConversationUpgradedEvent>(
      destination,
      (message) => {
        onEvent(message.data);
      },
    );

    if (subscription) {
      this.activeSubscriptions.set(existingKey, subscription);
    }

    return subscription;
  }

  /**
   * Subscribe to all user queues (ack, messages, events) at once
   * Call this after connection to receive all personal notifications
   */
  subscribeToAllUserQueues(handlers: {
    onAck?: (ack: AckEvent) => void;
    onMessage?: (event: ChatMessageEvent) => void;
    onConversationEvent?: (event: ConversationUpgradedEvent) => void;
  }): void {
    if (handlers.onAck) {
      this.subscribeToAck(handlers.onAck);
    }
    if (handlers.onMessage) {
      this.subscribeToIncomingMessages(handlers.onMessage);
    }
    if (handlers.onConversationEvent) {
      this.subscribeToConversationEvents(handlers.onConversationEvent);
    }
  }

  /**
   * Unsubscribe from all user queues
   */
  unsubscribeFromUserQueues(): void {
    const keys = ["user-ack", "user-messages", "user-events", "user-queue"];

    keys.forEach((key) => {
      const subscription = this.activeSubscriptions.get(key);
      if (subscription) {
        subscription.unsubscribe();
        this.activeSubscriptions.delete(key);
      }
    });
  }

  // ========== Chat Message Sending ==========

  /**
   * Send a chat message via WebSocket (STOMP)
   * Destination: /app/chat.send
   */
  sendChatMessage(payload: ChatSendPayload): void {
    if (!this.isConnected()) {
      console.warn("[WebSocket] Cannot send message: not connected");
      return;
    }

    stompClient.send("/app/chat.send", payload);
  }

  /**
   * Generate a unique client message ID for idempotency
   */
  static generateClientMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // ========== Presence Management ==========

  /**
   * Subscribe to presence updates
   * Destination: /user/queue/presence
   */
  subscribeToPresence(
    onPresence: (message: WebSocketMessage<unknown>) => void,
  ): StompSubscription | null {
    const destination = "/user/queue/presence";
    const existingKey = "user-presence";

    if (this.activeSubscriptions.has(existingKey)) {
      return this.activeSubscriptions.get(existingKey) || null;
    }

    const subscription = stompClient.subscribe(destination, onPresence);

    if (subscription) {
      this.activeSubscriptions.set(existingKey, subscription);
    }

    return subscription;
  }

  /**
   * Send heartbeat to maintain online status
   * Destination: /app/presence.heartbeat
   */
  sendPresenceHeartbeat(): void {
    if (!this.isConnected()) {
      console.warn("[WebSocket] Cannot send heartbeat: not connected");
      return;
    }

    stompClient.send("/app/presence.heartbeat", {});
  }

  /**
   * Unsubscribe from presence updates
   */
  unsubscribeFromPresence(): void {
    const subscription = this.activeSubscriptions.get("user-presence");
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete("user-presence");
    }
  }

  // ========== Notification Subscriptions ==========

  /**
   * Subscribe to real-time notifications
   * Destination: /user/queue/notifications
   */
  subscribeToNotifications(
    onNotification: (notification: unknown) => void,
  ): StompSubscription | null {
    const destination = "/user/queue/notifications";
    const existingKey = "user-notifications";

    if (this.activeSubscriptions.has(existingKey)) {
      return this.activeSubscriptions.get(existingKey) || null;
    }

    const subscription = stompClient.subscribe(destination, (message) => {
      onNotification(message.data);
    });

    if (subscription) {
      this.activeSubscriptions.set(existingKey, subscription);
    }

    return subscription;
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribeFromNotifications(): void {
    const subscription = this.activeSubscriptions.get("user-notifications");
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete("user-notifications");
    }
  }
}

export const websocketService = new WebSocketService();
export { WebSocketService };
