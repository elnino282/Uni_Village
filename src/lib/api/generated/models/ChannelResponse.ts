/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { ChannelPrivacy } from './ChannelPrivacy';
import type { ChannelType } from './ChannelType';
export type ChannelResponse = {
    id?: number;
    name?: string;
    description?: string;
    privacy?: ChannelPrivacy;
    channelType?: ChannelType;
    avatarUrl?: string;
    conversationId?: string;
    creatorId?: number;
    memberCount?: number;
    createdAt?: string;
};

