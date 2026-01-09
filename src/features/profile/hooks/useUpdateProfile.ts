import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { Profile, UpdateProfileRequest } from '../types';

interface UseUpdateProfileOptions {
    userId: string;
    onSuccess?: (data: Profile) => void;
    onError?: (error: Error) => void;
}

export function useUpdateProfile({ userId, onSuccess, onError }: UseUpdateProfileOptions) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(userId, data),
        onSuccess: (data) => {
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
            onSuccess?.(data);
        },
        onError: (error: Error) => {
            onError?.(error);
        },
    });

    return {
        updateProfile: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}
