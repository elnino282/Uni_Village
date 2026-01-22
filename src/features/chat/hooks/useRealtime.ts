import { useCallback, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

import { firestore } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/store/authStore';

const TYPING_TTL_MS = 5000;

export function useWebSocketConnection() {
    const connect = useCallback(async () => undefined, []);
    const disconnect = useCallback(() => undefined, []);

    return {
        isConnected: false,
        isConnecting: false,
        error: null,
        connect,
        disconnect,
    };
}

export function useConversationMessages() {
    return { realtimeMessages: [] };
}

export function useTypingIndicator(conversationId: string | undefined) {
    const [typingUsers, setTypingUsers] = useState<Array<{ userId: number; userName: string }>>([]);

    useEffect(() => {
        if (!conversationId) return;

        const typingRef = collection(firestore, 'conversations', conversationId, 'typing');
        const typingQuery = query(typingRef, where('isTyping', '==', true));

        const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
            const now = Date.now();
            const active = snapshot.docs
                .map((docSnap) => docSnap.data() as { userId: number; userName: string; updatedAt?: { toDate?: () => Date } })
                .filter((entry) => {
                    const updatedAt = entry.updatedAt?.toDate?.() ?? new Date(0);
                    return now - updatedAt.getTime() < TYPING_TTL_MS;
                })
                .map((entry) => ({ userId: entry.userId, userName: entry.userName }));

            setTypingUsers(active);
        });

        return () => unsubscribe();
    }, [conversationId]);

    const sendTypingEvent = useCallback(
        async (isTyping: boolean) => {
            const user = useAuthStore.getState().user;
            if (!conversationId || !user) return;

            const typingDoc = doc(firestore, 'conversations', conversationId, 'typing', String(user.id));
            await setDoc(
                typingDoc,
                {
                    userId: user.id,
                    userName: user.displayName,
                    isTyping,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
        },
        [conversationId]
    );

    return {
        typingUsers,
        isAnyoneTyping: typingUsers.length > 0,
        sendTypingEvent,
    };
}

export function useRealtimeUpdates() {
    return;
}
