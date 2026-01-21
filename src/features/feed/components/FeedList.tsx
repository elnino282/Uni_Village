/**
 * FeedList Component
 * Renders the feed with infinite scroll
 */

import { EmptyState, Spinner } from '@/shared/components';
import { Colors } from '@/shared/constants';
import { FlashList } from '@shopify/flash-list';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useFeed } from '../hooks/useFeed';
import { FeedCard } from './FeedCard';

export function FeedList() {
    const {
        feedItems,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useFeed();

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <Spinner size="lg" />
            </View>
        );
    }

    return (
        <FlashList
            data={feedItems}
            keyExtractor={(item) => item.id}
            estimatedItemSize={200}
            renderItem={({ item }) => (
                <FeedCard
                    item={item}
                    // TODO: Integrate with feed mutations
                    onLikePress={() => console.log('Like pressed', item.id)}
                    onCommentPress={() => console.log('Comment pressed', item.id)}
                    onSharePress={() => console.log('Share pressed', item.id)}
                    onUserPress={() => console.log('User pressed', item.author.id)}
                />
            )}
            refreshControl={
                <RefreshControl
                    refreshing={false}
                    onRefresh={refetch}
                    tintColor={Colors.light.tint}
                />
            }
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                <EmptyState
                    icon="📭"
                    title="No posts yet"
                    message="Be the first to share something!"
                />
            }
            ListFooterComponent={
                isFetchingNextPage ? <Spinner size="sm" /> : null
            }
            contentContainerStyle={styles.list}
        />
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
        gap: 16,
    },
});
