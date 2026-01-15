/**
 * PostCard Component
 * Displays a single post
 */

import { Avatar, Card } from '@/shared/components/ui';
import { Colors } from '@/shared/constants';
import { formatRelativeTime } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../types';

interface PostCardProps {
    post: Post;
    onPress?: () => void;
    onLike?: () => void;
    onComment?: () => void;
    onShare?: () => void;
}

export function PostCard({ post, onPress, onLike, onComment, onShare }: PostCardProps) {
    return (
        <Card variant="elevated" padding="none" onPress={onPress}>
            <View style={styles.header}>
                <Avatar
                    source={post.author.avatarUrl}
                    name={post.author.displayName}
                    size="md"
                />
                <View style={styles.headerInfo}>
                    <Text style={styles.authorName}>{post.author.displayName}</Text>
                    <Text style={styles.timestamp}>{formatRelativeTime(post.createdAt)}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.contentText}>{post.content}</Text>

                {post.imageUrls && post.imageUrls.length > 0 && (
                    <Image
                        source={{ uri: post.imageUrls[0] }}
                        style={styles.image}
                        contentFit="cover"
                    />
                )}
            </View>

            <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={onLike}>
                    <Text style={[styles.actionText, post.isLiked && styles.liked]}>
                        ❤️ {post.likesCount}
                    </Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={onComment}>
                    <Text style={styles.actionText}>💬 {post.commentsCount}</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={onShare}>
                    <Ionicons name="share-social-outline" size={18} color={Colors.light.icon} />
                </Pressable>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    headerInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    timestamp: {
        fontSize: 12,
        color: Colors.light.icon,
    },
    content: {
        paddingHorizontal: 12,
        gap: 12,
    },
    contentText: {
        fontSize: 15,
        color: Colors.light.text,
        lineHeight: 22,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    actions: {
        flexDirection: 'row',
        padding: 12,
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        color: Colors.light.icon,
    },
    liked: {
        color: '#ef4444',
    },
});
