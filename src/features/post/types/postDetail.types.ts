/**
 * Post Detail Types
 */

export type PostVisibility = 'public' | 'friends' | 'private';

export interface PostDetailAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isVerified?: boolean;
}

export interface PostDetailLocation {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
}

export interface PostDetail {
  id: string;
  author: PostDetailAuthor;
  content: string;
  imageUrl?: string;
  locations: PostDetailLocation[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  parentId?: string; // For nested replies
  replies?: Comment[];
}

export interface PostDetailResponse {
  post: PostDetail;
  comments: Comment[];
}
