import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import {
    channelsApi,
    type CreateChannelFormData,
    type UpdateChannelFormData,
} from '../api';
import type { AddChannelMemberRequest } from '@/shared/types/backend.types';

const STALE_TIME = 30 * 1000;

export function useChannel(channelId: number | undefined) {
    return useQuery({
        queryKey: queryKeys.channels.detail(channelId!),
        queryFn: async () => {
            const response = await channelsApi.getChannel(channelId!);
            return response.result;
        },
        enabled: !!channelId,
        staleTime: STALE_TIME,
    });
}

export function useChannelByConversation(conversationId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.channels.byConversation(conversationId!),
        queryFn: async () => {
            const response = await channelsApi.getChannelByConversation(conversationId!);
            return response.result;
        },
        enabled: !!conversationId,
        staleTime: STALE_TIME,
    });
}

export function useChannelMembers(channelId: number | undefined) {
    return useQuery({
        queryKey: queryKeys.channels.members(channelId!),
        queryFn: async () => {
            const response = await channelsApi.getChannelMembers(channelId!);
            return response.result;
        },
        enabled: !!channelId,
        staleTime: STALE_TIME,
    });
}

export function useCreateChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateChannelFormData) => channelsApi.createChannel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.channels.all });
        },
    });
}

export function useUpdateChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ channelId, data }: { channelId: number; data: UpdateChannelFormData }) =>
            channelsApi.updateChannel(channelId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.channels.detail(variables.channelId),
            });
        },
    });
}

export function useAddChannelMembers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ channelId, data }: { channelId: number; data: AddChannelMemberRequest }) =>
            channelsApi.addMembers(channelId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.channels.members(variables.channelId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.channels.detail(variables.channelId),
            });
        },
    });
}

export function useRemoveChannelMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ channelId, memberId }: { channelId: number; memberId: number }) =>
            channelsApi.removeMember(channelId, memberId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.channels.members(variables.channelId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.channels.detail(variables.channelId),
            });
        },
    });
}

export function useChannelJoinRequests(channelId: number | undefined) {
    return useQuery({
        queryKey: queryKeys.channels.joinRequests(channelId!),
        queryFn: async () => {
            const response = await channelsApi.getJoinRequests(channelId!);
            return response.result;
        },
        enabled: !!channelId,
        staleTime: STALE_TIME,
    });
}
