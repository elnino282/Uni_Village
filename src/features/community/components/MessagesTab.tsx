import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/shared/constants';
import { useColorScheme, useDebounce } from '@/shared/hooks';
import type { MessagesSubTab } from '../types/message.types';
import { ChannelList } from './ChannelList';
import { InboxList } from './InboxList';
import { MessagesSearchRow } from './MessagesSearchRow';
import { MessagesSubTabs } from './MessagesSubTabs';

/**
 * Messages tab content with search, sub-tabs, and lists
 * Matches Figma nodes 204:537 (Inbox) and 204:734 (Channel)
 */
export function MessagesTab() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  // Local state for sub-tab and search
  const [activeSubTab, setActiveSubTab] = useState<MessagesSubTab>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search for performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleCreatePress = () => {
    router.push('/chat/new' as Href);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Search row with create button */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <MessagesSearchRow
          value={searchQuery}
          onChangeText={setSearchQuery}
          onPressCreate={handleCreatePress}
        />
        
        {/* Sub-tabs: Hộp thư / Channel */}
        <MessagesSubTabs
          activeTab={activeSubTab}
          onTabChange={setActiveSubTab}
        />
      </View>

      {/* List content */}
      {activeSubTab === 'inbox' ? (
        <InboxList searchQuery={debouncedSearch} />
      ) : (
        <ChannelList searchQuery={debouncedSearch} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 4,
  },
});
