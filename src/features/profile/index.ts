/**
 * Profile Feature - Public API
 */

// Components
export { EditProfileFormRow } from './components/EditProfileFormRow';
export { EditProfileFormSection } from './components/EditProfileFormSection';
export { EditProfileHeader } from './components/EditProfileHeader';
export { EditProfileScreen } from './components/EditProfileScreen';
export { InterestChips } from './components/InterestChips';
export { InterestsBottomSheet } from './components/InterestsBottomSheet';
export { ProfileActionButtons } from './components/ProfileActionButtons';
export { ProfileEmptyPostCard } from './components/ProfileEmptyPostCard';
export { ProfileFAB } from './components/ProfileFAB';
export { ProfileHeader } from './components/ProfileHeader';
export { ProfileHeaderIcons } from './components/ProfileHeaderIcons';
export { ProfileInfo } from './components/ProfileInfo';
export { ProfilePostCard } from './components/ProfilePostCard';
export { ProfileScreen } from './components/ProfileScreen';
export { ProfileTabs } from './components/ProfileTabs';
export type { ProfileTabKey } from './components/ProfileTabs';
export { PublicProfileHeader } from './components/PublicProfileHeader';
export { PublicProfileScreen } from './components/PublicProfileScreen';
export { PublicProfileTabs } from './components/PublicProfileTabs';

// Hooks
export { useProfile } from './hooks/useProfile';
export { useProfilePosts } from './hooks/useProfilePosts';
export { usePublicProfile } from './hooks/usePublicProfile';

// Schemas
export { editProfileSchema, profileLinkSchema } from './schemas';
export type { EditProfileFormData } from './schemas';

// Services
export { getMockProfile, mockProfile } from './services/mockProfile';
export { fetchProfilePosts, getMockProfilePosts } from './services/mockProfilePosts';
export { fetchPublicProfile, getMockPublicProfile } from './services/mockPublicProfile';
export { fetchSavedPosts, getMockSavedPosts } from './services/mockSavedPosts';

// Types
export type {
  Profile,
  ProfileLink, ProfilePost,
  ProfilePostAuthor,
  ProfilePostLocation,
  ProfilePostReactions, PublicProfile,
  PublicProfileTab, UpdateProfileRequest
} from './types';

