/**
 * Feed API
 */

import type { PaginationParams } from '@/shared/types';
import { apiClient } from '../../../lib/api/client';
import { API_ENDPOINTS } from '../../../lib/api/endpoints';
import type { FeedResponse } from '../types';

export const feedApi = {
    getFeed: (params: PaginationParams): Promise<FeedResponse> =>
        apiClient.get<FeedResponse>(API_ENDPOINTS.POSTS.FEED, { params }),
};
