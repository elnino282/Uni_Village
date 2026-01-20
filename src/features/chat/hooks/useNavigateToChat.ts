import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { conversationsApi } from '../api';
import type { RelationshipStatus } from '../api/friends.api';

export function useNavigateToChat() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const { mutateAsync: getOrCreateConversation } = useMutation({
        mutationFn: async (targetUserId: number) => {
            const response = await conversationsApi.getOrCreateDirect(targetUserId);
            return response.result.conversationId;
        },
    });

    const handleNavigateToUser = async (
        userId: number,
        relationshipStatus?: RelationshipStatus
    ) => {
        if (isNavigating) return;

        try {
            setIsNavigating(true);

            const conversationId = await getOrCreateConversation(userId);

            router.push(`/chat/${conversationId}` as any);
        } catch (error) {
            console.error('[useNavigateToChat] Error creating conversation:', error);
        } finally {
            setIsNavigating(false);
        }
    };

    return {
        handleNavigateToUser,
        isNavigating,
    };
}
