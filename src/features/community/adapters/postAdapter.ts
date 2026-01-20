import type { PostResponse } from '@/features/post/types';
import type { CommunityPost, CommunityPostsResponse, PostAuthor } from '../types';

export function mapPostResponseToCommunityPost(post: PostResponse): CommunityPost {
    const author: PostAuthor = {
        id: String(post.authorId),
        displayName: post.authorName || 'Unknown',
        avatarUrl: post.authorAvatarUrl || undefined,
    };

    return {
        id: String(post.id),
        author,
        content: post.content || '',
        imageUrl: post.mediaUrls?.[0],
        postType: post.postType,
        locations: post.locations?.map((location: any) => ({
            id: String(location.id ?? location.placeId ?? location.name),
            name: location.name ?? '',
            address: location.address ?? undefined,
            lat: location.lat ?? undefined,
            lng: location.lng ?? undefined,
            placeId: location.placeId ?? undefined,
        })) ?? [],
        likesCount: post.reactionCount ?? 0,
        commentsCount: post.commentCount ?? 0,
        sharesCount: 0,
        isLiked: post.isLiked ?? false,
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
    const posts = (slice.content ?? []).map(mapPostResponseToCommunityPost);

    return {
        data: posts,
        pagination: {
            page: typeof slice.number === 'number' ? slice.number + 1 : page,
            limit: size,
            total: 0,
            totalPages: 1,
            hasMore: !slice.last,
        },
    };
}
