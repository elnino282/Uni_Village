import { Href, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/shared/components/feedback';
import { Spinner } from '@/shared/components/ui';
import { Colors, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import { useConversations } from '../hooks/useConversations';
import type { Conversation } from '../types/message.types';
import { ConversationItem } from './ConversationItem';

interface InboxListProps {
  searchQuery: string;
}

/**
 * FlatList of direct message conversations
 */
export function InboxList({ searchQuery }: InboxListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { data, isLoading, error, refetch } = useConversations(
    1,
    20,
    searchQuery || undefined
  );

  const handleConversationPress = (conversation: Conversation) => {
    // Navigate to chat thread (stub screen)
    router.push(`/chat/${conversation.id}` as Href);
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={handleConversationPress}
    />
  );

  const keyExtractor = (item: Conversation) => item.id;

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <Spinner size="lg" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <EmptyState
          icon="❌"
          title="Đã xảy ra lỗi"
          message="Không thể tải tin nhắn. Vui lòng thử lại."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const conversations = data?.data || [];

  if (conversations.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <EmptyState
          icon="💬"
          title={searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có tin nhắn'}
          message={
            searchQuery
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Bắt đầu trò chuyện với bạn bè ngay!'
          }
        />
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.list, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
