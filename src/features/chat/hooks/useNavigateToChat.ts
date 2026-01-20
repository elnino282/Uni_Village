import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { conversationsApi } from '../api';
import type { RelationshipStatus } from '../api/friends.api';

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

            router.push(`/chat/user-${userId}` as any);
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
