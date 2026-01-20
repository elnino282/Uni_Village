import { useMutation, useQueryClient } from '@tanstack/react-query';

import { friendsApi } from '../api';

export function useSendFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (targetUserId: number) => friendsApi.sendFriendRequest(targetUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
    });
}
