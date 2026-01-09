/**
 * Community feature types
 */

export type CommunityTab = 'posts' | 'messages';

export interface PostLocation {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
}

export interface PostAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface CommunityPost {
  id: string;
  author: PostAuthor;
  content: string;
  imageUrl?: string;
  locations: PostLocation[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OverflowMenuItem {
  id: string;
  label: string;
  icon: string;
  variant?: 'default' | 'danger';
  onPress: () => void;
}

export interface CommunityPostsResponse {
  data: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
