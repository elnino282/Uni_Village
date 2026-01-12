/**
 * Channel Feature Barrel Export
 */

// Screens
export { ChannelInfoScreen } from './screens';

// Hooks
export { useChannelInfo, useJoinChannel, useLeaveChannel } from './hooks';

// Services
export { MOCK_CHANNEL_INFO, channelInfoService } from './services';

// Types
export type { ChannelInfo, ChannelInfoResponse, ChannelInvite, ChannelMember, JoinChannelResponse } from './types';
