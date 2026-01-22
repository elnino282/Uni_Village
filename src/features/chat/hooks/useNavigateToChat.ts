import { useRouter } from 'expo-router';
import { useState } from 'react';

import { auth } from '@/lib/firebase';
import { buildDmConversationId, getConversation } from '../services';
import type { RelationshipStatus } from '../api/friends.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useNavigateToChat() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigateToUser = async (
        userId: number,
        relationshipStatus?: RelationshipStatus
    ) => {
        if (isNavigating) return;

        try {
            setIsNavigating(true);

            const currentUser = useAuthStore.getState().user;
            const currentUid = auth.currentUser?.uid ?? currentUser?.id?.toString();
            const peerUid = userId.toString();
            let threadId = `user-${userId}`;

            if (currentUid) {
                const dmId = buildDmConversationId(currentUid, peerUid);
                const existing = await getConversation(dmId);
                if (existing) {
                    threadId = dmId;
                }
            }

            router.push(`/chat/${threadId}` as any);
        } catch (error) {
            console.error('[useNavigateToChat] Error navigating to chat:', error);
        } finally {
            setIsNavigating(false);
        }
    };

    return {
        handleNavigateToUser,
        isNavigating,
    };
}
