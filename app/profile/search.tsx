import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserSearchResults } from '@/features/community/components';
import { EmptyState } from '@/shared/components/feedback';
import { Colors, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

export default function ProfileSearchScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const [searchQuery, setSearchQuery] = useState('');

    const handleUserSelect = (userId: number) => {
        router.push({
            pathname: '/profile/[userId]',
            params: { userId: userId.toString() }
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </Pressable>

                <View style={[styles.searchContainer, { backgroundColor: colors.chipBackground }]}>
                    <MaterialIcons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Tìm kiếm người dùng..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    )}
                </View>
            </View>

            {searchQuery.length < 2 ? (
                <EmptyState
                    icon="search"
                    title="Tìm kiếm người dùng"
                    message="Nhập tên hoặc số điện thoại để tìm kiếm"
                />
            ) : (
                <UserSearchResults
                    query={searchQuery}
                    onUserSelect={handleUserSelect}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderBottomWidth: 1,
        gap: Spacing.sm,
    },
    backButton: {
        padding: Spacing.xs,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
});
