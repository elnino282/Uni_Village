/**
 * ProfileHeader Component
 */

import { Avatar, Button } from '@/shared/components/ui';
import { Colors } from '@/shared/constants';
import { formatCompact } from '@/shared/utils';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import type { Profile } from '../types';

interface ProfileHeaderProps {
    profile: Profile;
    isOwnProfile?: boolean;
    onEditPress?: () => void;
    onFollowPress?: () => void;
}

export function ProfileHeader({
    profile,
    isOwnProfile = false,
    onEditPress,
    onFollowPress,
}: ProfileHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Cover Image */}
            {profile.coverUrl ? (
                <Image
                    source={{ uri: profile.coverUrl }}
                    style={styles.cover}
                    contentFit="cover"
                />
            ) : (
                <View style={styles.coverPlaceholder} />
            )}

            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <Avatar
                    source={profile.avatarUrl}
                    name={profile.displayName}
                    size="xl"
                    style={styles.avatar}
                />
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.displayName}>{profile.displayName}</Text>
                <Text style={styles.username}>@{profile.username}</Text>

                {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                {/* Stats */}
                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{formatCompact(profile.postsCount)}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{formatCompact(profile.followersCount)}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{formatCompact(profile.followingCount)}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>

                {/* Actions */}
                {isOwnProfile ? (
                    <Button
                        title="Edit Profile"
                        variant="outline"
                        size="sm"
                        onPress={onEditPress}
                    />
                ) : (
                    <Button
                        title={profile.isFollowing ? 'Following' : 'Follow'}
                        variant={profile.isFollowing ? 'outline' : 'primary'}
                        size="sm"
                        onPress={onFollowPress}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    cover: {
        height: 120,
        width: '100%',
    },
    coverPlaceholder: {
        height: 120,
        backgroundColor: Colors.light.muted,
    },
    avatarContainer: {
        marginTop: -40,
        paddingHorizontal: 16,
    },
    avatar: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    info: {
        padding: 16,
        gap: 8,
    },
    displayName: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
    },
    username: {
        fontSize: 14,
        color: Colors.light.icon,
    },
    bio: {
        fontSize: 14,
        color: Colors.light.text,
        lineHeight: 20,
    },
    stats: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 8,
        marginBottom: 16,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.icon,
    },
});
