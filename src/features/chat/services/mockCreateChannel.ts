/**
 * Mock Create Channel Service
 * Mock service for channel creation
 */
import type { CreateChannelInput, CreateChannelResponse } from '../types/channel.types';

/**
 * Create a new channel
 * Returns a mock response with generated channel ID
 */
export async function createChannel(
  input: CreateChannelInput
): Promise<CreateChannelResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Generate a unique channel ID
  const channelId = `channel-${Date.now()}`;

  return {
    success: true,
    channelId,
    channel: {
      id: channelId,
      name: input.name,
      avatarUrl: undefined, // Will be generated later
      memberCount: input.memberIds.length + 1, // Include creator
      category: input.category,
    },
  };
}
