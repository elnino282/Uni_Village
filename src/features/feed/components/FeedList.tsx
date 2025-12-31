/**
 * FeedList Component
 * Renders the feed with infinite scroll
 */

import { EmptyState, Spinner } from '@/shared/components';
import { Colors } from '@/shared/constants';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFeed } from '../hooks/useFeed';

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
        <FlatList
            data={feedItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                // TODO: Replace with FeedCard component
                <View style={styles.placeholder}>
                    <Text>{item.content}</Text>
                </View>
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
    placeholder: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
});
