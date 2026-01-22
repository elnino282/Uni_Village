/**
 * useUserQueueSubscription hook
 * 
 * @deprecated This hook is deprecated. Firebase RTDB handles real-time subscriptions.
 * 
 * With Firebase RTDB:
 * - Messages are handled via useChatSubscription (subscribeToMessagesSnapshot)
 * - Presence is handled via rtdbPresenceService
 * - Typing indicators are handled via rtdbTypingService
 * - Conversation updates are handled via subscribeToConversationList
 * 
 * This file is kept for backward compatibility but provides no-op implementations.
 */

import { useFirebaseChat } from '@/providers/FirebaseChatProvider';
import { useEffect, useRef } from 'react';

/**
 * @deprecated Firebase RTDB handles user-specific events automatically
 * Messages, presence, and typing are all handled via RTDB subscriptions
 */
export function useUserQueueSubscription() {
    const subscriptionsRef = useRef<boolean>(false);
    const { isConnected } = useFirebaseChat();

    useEffect(() => {
        if (isConnected) {
            subscriptionsRef.current = true;
        }

        return () => {
            subscriptionsRef.current = false;
        };
    }, [isConnected]);

    return {
        isSubscribed: subscriptionsRef.current && isConnected,
    };
}

/**
 * @deprecated Firebase RTDB handles auto-subscription via FirebaseChatProvider
 */
export function useAutoUserQueueSubscription() {
    const { isConnected } = useFirebaseChat();
    const { isSubscribed } = useUserQueueSubscription();

    return {
        isSubscribed,
        isConnected,
    };
}
