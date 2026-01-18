import type {
    PostResponse as BackendPostResponse,
    PostType,
    Visibility,
    CommentRequest as BackendCommentRequest,
    CommentResponse as BackendCommentResponse,
    LikeResponse as BackendLikeResponse,
    SavedPostResponse as BackendSavedPostResponse,
    SharePostRequest as BackendSharePostRequest,
    SharePostResponse as BackendSharePostResponse,
} from '@/shared/types/backend.types';

export type PostResponse = BackendPostResponse;
export type Post = BackendPostResponse;
export type CommentRequest = BackendCommentRequest;
export type CommentResponse = BackendCommentResponse;
export type LikeResponse = BackendLikeResponse;
export type SavedPostResponse = BackendSavedPostResponse;
export type SharePostRequest = BackendSharePostRequest;
export type SharePostResponse = BackendSharePostResponse;

export type { PostType, Visibility };

export interface PostSearchParams {
    page?: number;
    size?: number;
}

export interface CreatePostFormData {
    content?: string;
    postType: PostType;
    visibility: Visibility;
    tourId?: string;
    files?: File[];
}

export interface UpdatePostFormData {
    content?: string;
    postType: PostType;
    visibility: Visibility;
    tourId?: string;
    files?: File[];
}

