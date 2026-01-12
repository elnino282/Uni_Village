/**
 * Channel feature types
 */

// Re-export shared types for convenience
export type { ChannelInfo, ChannelInvite, ChannelMember } from '@/shared/types';

/**
 * Response type for channel info query
 */
export interface ChannelInfoResponse {
    data: import('@/shared/types').ChannelInfo;
}

/**
 * Join channel mutation response
 */
export interface JoinChannelResponse {
    success: boolean;
    channelId: string;
}
