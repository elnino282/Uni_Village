/**
 * Channel types for invite cards and channel info
 */

/**
 * Channel invite data for embedding in posts
 */
export interface ChannelInvite {
    channelId: string;
    name: string;
    emoji?: string;
    description: string;
    memberCount: number;
    iconUrl?: string;
}

/**
 * Channel member for avatar display
 */
export interface ChannelMember {
    id: string;
    displayName: string;
    avatarUrl?: string;
}

/**
 * Full channel info for the info screen
 */
export interface ChannelInfo {
    id: string;
    name: string;
    emoji?: string;
    description: string;
    memberCount: number;
    iconUrl?: string;
    previewImageUrl?: string;
    creator: {
        id: string;
        displayName: string;
    };
    members: ChannelMember[];
    isJoined: boolean;
}
