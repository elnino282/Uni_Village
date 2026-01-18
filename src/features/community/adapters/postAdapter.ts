import type { PostResponse } from '@/features/post/types';
import type { CommunityPost, CommunityPostsResponse, PostAuthor } from '../types';

export function mapPostResponseToCommunityPost(post: PostResponse): CommunityPost {
    const author: PostAuthor = {
        id: String(post.authorId),
        displayName: post.authorName,
        avatarUrl: post.authorAvatarUrl || undefined,
    };

    return {
        id: String(post.id),
        author,
        content: post.content || '',
        imageUrl: post.mediaUrls?.[0],
        locations: [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        visibility: post.visibility === 'PUBLIC' ? 'public' : 'private',
    };
}

export function mapSliceToCommunityPostsResponse(
    slice: any,
    page: number,
    size: number
): CommunityPostsResponse {
    const posts = slice.content.map(mapPostResponseToCommunityPost);

    return {
        data: posts,
        pagination: {
            page: slice.number + 1,
            limit: size,
            total: 0,
            totalPages: 1,
            hasMore: !slice.last,
        },
    };
}
