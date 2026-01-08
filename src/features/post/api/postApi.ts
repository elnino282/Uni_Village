/**
 * Post API
 */

import { apiClient } from '../../../lib/api/client';
import { API_ENDPOINTS } from '../../../lib/api/endpoints';
import type { CreatePostRequest, Post, UpdatePostRequest } from '../types';

export const postApi = {
    createPost: (data: CreatePostRequest): Promise<Post> =>
        apiClient.post<Post>(API_ENDPOINTS.POSTS.BASE, data),

    getPost: (id: string): Promise<Post> =>
        apiClient.get<Post>(API_ENDPOINTS.POSTS.BY_ID(id)),

    updatePost: (id: string, data: UpdatePostRequest): Promise<Post> =>
        apiClient.put<Post>(API_ENDPOINTS.POSTS.BY_ID(id), data),

    deletePost: (id: string): Promise<void> =>
        apiClient.delete<void>(API_ENDPOINTS.POSTS.BY_ID(id)),
};
