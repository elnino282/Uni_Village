import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MessageReaction {
    messageId: string;
    userId: number;
    userName: string;
    emoji: string;
    timestamp: string;
}

export function useMessageReactions(messageId: string | undefined, conversationId: string | undefined) {
    const reactions: MessageReaction[] = [];
    const groupedReactions: Record<string, MessageReaction[]> = {};

    return { reactions, groupedReactions };
}

export function useAddMessageReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, emoji, conversationId }: { messageId: string; emoji: string; conversationId: string }) => {
            return { success: true };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['messages', variables.conversationId],
            });
        },
    });
}

export function useRemoveMessageReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, emoji, conversationId }: { messageId: string; emoji: string; conversationId: string }) => {
            return { success: true };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['messages', variables.conversationId],
            });
        },
    });
}
