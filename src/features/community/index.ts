// Community feature barrel export

// Components - selectively export to avoid name conflicts
export { CommunityFAB, CommunityHeader, PostActions as CommunityPostActions, PostCard as CommunityPostCard, PostHeader as CommunityPostHeader, PostLocations as CommunityPostLocations, PostMedia as CommunityPostMedia, CommunityScreen, CommunitySearchBar, CommunitySegmentedTabs, MessagesTab, PostOverflowMenu } from './components';

// Hooks
export * from './hooks';

// Types - export with prefix to avoid conflicts
export type {
    CommunityPost, PostAuthor as CommunityPostAuthor, PostLocation as CommunityPostLocation, CommunityPostsResponse, CommunityTab, OverflowMenuItem
} from './types';

// Services
export { MOCK_POSTS, communityService } from './services';

// Utils
export * from './utils';
