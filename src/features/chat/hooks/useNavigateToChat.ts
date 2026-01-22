import { useRouter } from 'expo-router';
import { useState } from 'react';

import { auth } from '@/lib/firebase';
import { conversationsApi } from '../api';
import { ensureConversation } from '../services/firebaseRtdb.service';
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
            const firebaseUser = auth.currentUser;
            let threadId = `user-${userId}`;

            const response = await conversationsApi.getOrCreateDirect(userId);
            const conversationId = response.result?.conversationId;

            if (conversationId) {
                threadId = conversationId;

                if (currentUser && firebaseUser) {
                    await ensureConversation(conversationId, {
                        type: 'dm',
                        members: [
                            {
                                uid: firebaseUser.uid,
                                displayName: currentUser.displayName,
                                avatarUrl: currentUser.avatarUrl,
                                legacyUserId: currentUser.id,
                            },
                            {
                                uid: userId.toString(),
                                displayName: '',
                                legacyUserId: userId,
                            },
                        ],
                    });
                }
            }

            router.push(`/chat/${threadId}` as any);
        } catch (error) {
            console.error('[useNavigateToChat] Error navigating to chat:', error);
            router.push(`/chat/user-${userId}` as any);
        } finally {
            setIsNavigating(false);
        }
    };

    return {
        handleNavigateToUser,
        isNavigating,
    };
}
