import { useMutation, useQueryClient } from '@tanstack/react-query';

import { friendsApi } from '../api';

export function useAcceptFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requesterId: number) => friendsApi.acceptFriendRequest(requesterId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        },
    });
}
