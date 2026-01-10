// ItineraryScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/useColorScheme';

type ItineraryTab = 'ongoing' | 'upcoming' | 'past';

const TABS: { key: ItineraryTab; label: string }[] = [
    { key: 'ongoing', label: 'Đang diễn ra' },
    { key: 'upcoming', label: 'Sắp tới' },
    { key: 'past', label: 'Đã đi' },
];

const SUGGESTIONS = ['Quán cà phê gần đây', 'Quán cá viên chiên gần đây', 'Khám phá quanh đây'];

export function ItineraryScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme] as (typeof Colors)['light'];
    const [activeTab, setActiveTab] = useState<ItineraryTab>('ongoing');

    const tabStyles = useMemo(() => ({
        activeBg: colors.info,
        activeText: '#fff',
        inactiveBg: colors.muted,
        inactiveText: colors.text,
        border: colors.borderLight ?? colors.border,
    }), [colors]);

    const renderContent = () => {
        if (activeTab === 'upcoming') {
            return (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.muted }]}>
                        <Ionicons name="calendar-clear-outline" size={42} color={colors.info} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.text, marginTop: 12 }]}>
                        Bạn đã lên kế hoạch gì cho sắp tới chưa?
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary ?? colors.icon, marginTop: 8 }]}>
                        Lên lịch trước để app nhắc giờ đi, check-in và gợi ý địa điểm phù hợp.
                    </Text>
                    <Pressable style={[styles.primaryButton, { backgroundColor: colors.info, marginTop: 16 }]}>
                        <Text style={styles.primaryButtonText}>Lên kế hoạch chuyến đi</Text>
                    </Pressable>
                </View>
            );
        }

        if (activeTab === 'past') {
            return (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.muted }]}>
                        <Ionicons name="refresh-circle-outline" size={44} color={colors.info} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.text, marginTop: 12 }]}>
                        Nhật ký hành trình của bạn vẫn còn trống
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary ?? colors.icon, marginTop: 8 }]}>
                        Các chuyến đi đã hoàn thành sẽ xuất hiện tại đây để bạn xem lại và tạo lại lịch trình tương tự.
                    </Text>
                </View>
            );
        }

        return (
            <View style={[styles.card, { backgroundColor: colors.card ?? '#fff', borderColor: colors.border }]}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?w=800&auto=format&fit=crop&q=80' }}
                    style={styles.hero}
                    resizeMode="cover"
                />
                <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Bạn muốn đi đâu hôm nay?
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary ?? colors.icon }]}>
                        Chưa có lịch trình nào được tạo. Hãy bắt đầu bằng cách chọn điểm đến hoặc để AI gợi ý hành trình phù hợp với bạn.
                    </Text>
                    <Pressable
                        style={[styles.primaryButton, { backgroundColor: colors.info }]}
                        onPress={() => router.push('/(modals)/create-itinerary')}
                    >
                        <Text style={styles.primaryButtonText}>Tạo chuyến đi mới</Text>
                    </Pressable>
                    <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.background }]}>
                        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Gợi ý lịch trình bằng AI</Text>
                    </Pressable>
                    <View style={styles.suggestionRow}>
                        {SUGGESTIONS.map(tag => (
                            <View
                                key={tag}
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: colors.muted,
                                        borderColor: colors.border,
                                        marginHorizontal: 4,
                                    },
                                ]}
                            >
                                <Text style={[styles.chipText, { color: colors.textSecondary ?? colors.icon }]}>
                                    {tag}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary ?? colors.text }]}>
                        Lịch trình của tôi
                    </Text>
                    <Ionicons name="settings-outline" size={22} color={colors.icon} />
                </View>

                <View style={[styles.tabList, { backgroundColor: colors.backgroundSecondary ?? colors.muted, borderColor: tabStyles.border }]}>
                    {TABS.map(tab => {
                        const isActive = tab.key === activeTab;
                        return (
                            <Pressable
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                style={[
                                    styles.tab,
                                    {
                                        backgroundColor: isActive ? tabStyles.activeBg : tabStyles.inactiveBg,
                                        borderColor: tabStyles.border,
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.tabLabel,
                                    { color: isActive ? tabStyles.activeText : tabStyles.inactiveText },
                                ]}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    tabList: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    hero: {
        width: '100%',
        height: 170,
    },
    cardBody: {
        padding: 16,
        gap: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    primaryButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    suggestionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 16,
        gap: 8,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
