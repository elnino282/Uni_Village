import { apiClient, createMultipartDataWithSingleFile, type FileUpload } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
    AddChannelMemberRequest,
    ChannelMemberResponse,
    ChannelPrivacy,
    ChannelResponse,
    ChannelType,
    JoinConversationResponse,
} from '@/shared/types/backend.types';

export interface CreateChannelFormData {
    name: string;
    description?: string;
    privacy?: ChannelPrivacy;
    channelType?: ChannelType;
    participantIds?: number[];
    avatar?: FileUpload;
}

export interface UpdateChannelFormData {
    name?: string;
    description?: string;
    avatar?: FileUpload;
}

export const channelsApi = {
    createChannel: (data: CreateChannelFormData): Promise<ApiResponse<ChannelResponse>> => {
        const formData = createMultipartDataWithSingleFile(
            {
                name: data.name,
                description: data.description,
                privacy: data.privacy,
                channelType: data.channelType,
                participantIds: data.participantIds ? JSON.stringify(data.participantIds) : undefined,
            },
            data.avatar,
            'avatar'
        );
        return apiClient.postMultipart<ApiResponse<ChannelResponse>>(
            API_ENDPOINTS.CHANNELS.CREATE,
            formData
        );
    },

    getChannel: (channelId: number): Promise<ApiResponse<ChannelResponse>> =>
        apiClient.get<ApiResponse<ChannelResponse>>(
            API_ENDPOINTS.CHANNELS.BY_ID(channelId)
        ),

    getChannelByConversation: (conversationId: string): Promise<ApiResponse<ChannelResponse>> =>
        apiClient.get<ApiResponse<ChannelResponse>>(
            API_ENDPOINTS.CHANNELS.BY_CONVERSATION(conversationId)
        ),

    updateChannel: (
        channelId: number,
        data: UpdateChannelFormData
    ): Promise<ApiResponse<ChannelResponse>> => {
        const formData = createMultipartDataWithSingleFile(
            {
                name: data.name,
                description: data.description,
            },
            data.avatar,
            'avatar'
        );
        return apiClient.patchMultipart<ApiResponse<ChannelResponse>>(
            API_ENDPOINTS.CHANNELS.BY_ID(channelId),
            formData
        );
    },

    getChannelMembers: (channelId: number): Promise<ApiResponse<ChannelMemberResponse[]>> =>
        apiClient.get<ApiResponse<ChannelMemberResponse[]>>(
            API_ENDPOINTS.CHANNELS.MEMBERS(channelId)
        ),

    addMembers: (
        channelId: number,
        data: AddChannelMemberRequest
    ): Promise<ApiResponse<ChannelResponse>> =>
        apiClient.post<ApiResponse<ChannelResponse>>(
            API_ENDPOINTS.CHANNELS.MEMBERS(channelId),
            data
        ),

    removeMember: (channelId: number, memberId: number): Promise<ApiResponse<ChannelResponse>> =>
        apiClient.delete<ApiResponse<ChannelResponse>>(
            API_ENDPOINTS.CHANNELS.REMOVE_MEMBER(channelId, memberId)
        ),

    getJoinRequests: (channelId: number): Promise<ApiResponse<JoinConversationResponse[]>> =>
        apiClient.get<ApiResponse<JoinConversationResponse[]>>(
            API_ENDPOINTS.CHANNELS.JOIN_REQUESTS(channelId)
        ),
};
