// ItineraryScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/useColorScheme';

type ItineraryTab = 'ongoing' | 'upcoming' | 'past';

interface SavedTrip {
  id: string;
  tripName: string;
  startDate: string;
  startTime: string;
  destinations: {
    id: string;
    name: string;
    thumbnail: string;
    order: number;
  }[];
  createdAt: string;
  status: ItineraryTab;
}

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
    const [trips, setTrips] = useState<SavedTrip[]>([]);
    const [showNewTripBanner, setShowNewTripBanner] = useState(false);
    const [newlyCreatedTrip, setNewlyCreatedTrip] = useState<SavedTrip | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadTrips();
        }, [])
    );

    const loadTrips = async () => {
        try {
            const tripsJson = await AsyncStorage.getItem('@trips');
            if (tripsJson) {
                const loadedTrips: SavedTrip[] = JSON.parse(tripsJson);
                setTrips(loadedTrips);
                
                // Check if there's a newly created trip (within last 5 seconds)
                const now = Date.now();
                const newestTrip = loadedTrips.find(trip => {
                    const createdAt = new Date(trip.createdAt).getTime();
                    return now - createdAt < 5000; // 5 seconds
                });
                if (newestTrip) {
                    setShowNewTripBanner(true);
                    setNewlyCreatedTrip(newestTrip);
                } else {
                    setShowNewTripBanner(false);
                    setNewlyCreatedTrip(null);
                }
            }
        } catch (error) {
            console.error('Failed to load trips:', error);
        }
    };

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => trip.status === activeTab);
    }, [trips, activeTab]);

    const tabStyles = useMemo(() => ({
        activeBg: colors.info,
        activeText: '#fff',
        inactiveBg: colors.muted,
        inactiveText: colors.text,
        border: colors.borderLight ?? colors.border,
    }), [colors]);

    const renderContent = () => {
        // Show trip list if there are trips for this tab
        if (filteredTrips.length > 0) {
            return (
                <View>
                    {/* New Trip Banner */}
                    {showNewTripBanner && activeTab === 'upcoming' && newlyCreatedTrip && (
                        <View style={[styles.bannerCard, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
                            <Ionicons name="information-circle" size={20} color="#2196F3" />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.bannerTitle, { color: '#1976D2' }]}>
                                    Lịch trình mới tạo gần đây
                                </Text>
                                <Text style={[styles.bannerSubtitle, { color: '#1976D2' }]}>
                                    {newlyCreatedTrip.destinations[0]?.name || 'Điểm đến'} • {new Date(newlyCreatedTrip.startDate).toLocaleDateString('vi-VN')} • {newlyCreatedTrip.destinations.length} điểm đến
                                </Text>
                                <Pressable onPress={() => {
                                    setShowNewTripBanner(false);
                                    router.push({
                                        pathname: "/(modals)/itinerary-detail" as any,
                                        params: {
                                            tripId: newlyCreatedTrip.id,
                                            tripName: newlyCreatedTrip.tripName,
                                            startDate: newlyCreatedTrip.startDate,
                                            startTime: newlyCreatedTrip.startTime,
                                            destinations: JSON.stringify(newlyCreatedTrip.destinations),
                                        }
                                    });
                                }}>
                                    <Text style={[styles.bannerLink, { color: '#2196F3' }]}>
                                        Xem lại lịch trình
                                    </Text>
                                </Pressable>
                            </View>
                            <Pressable onPress={() => setShowNewTripBanner(false)}>
                                <Ionicons name="close" size={20} color="#1976D2" />
                            </Pressable>
                        </View>
                    )}

                    {/* Trip List Header */}
                    <View style={styles.listHeader}>
                        <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
                            Danh sách chuyến đi
                        </Text>
                        <Pressable 
                            style={styles.aiButton}
                            onPress={() => router.push("/(modals)/ai-itinerary" as any)}
                        >
                            <Ionicons name="sparkles" size={16} color="#FF6B6B" />
                            <Text style={[styles.aiButtonText, { color: colors.info }]}>
                                Gợi ý bằng AI
                            </Text>
                        </Pressable>
                    </View>

                    {/* Trip Cards */}
                    {filteredTrips.map((trip) => {
                        const tripDate = new Date(trip.startDate);
                        const tripTime = new Date(trip.startTime);
                        
                        return (
                            <Pressable
                                key={trip.id}
                                style={[styles.tripCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => {
                                    // If trip is ongoing, go to active trip screen
                                    if (trip.status === 'ongoing') {
                                        router.push({
                                            pathname: "/(modals)/active-trip" as any,
                                            params: { tripId: trip.id }
                                        });
                                    } else if (trip.status === 'past') {
                                        // If trip is past, go to completed trip screen
                                        router.push({
                                            pathname: "/(modals)/completed-trip" as any,
                                            params: { tripId: trip.id }
                                        });
                                    } else {
                                        // Otherwise go to detail screen
                                        router.push({
                                            pathname: "/(modals)/itinerary-detail" as any,
                                            params: {
                                                tripId: trip.id,
                                                tripName: trip.tripName,
                                                startDate: trip.startDate,
                                                startTime: trip.startTime,
                                                destinations: JSON.stringify(trip.destinations),
                                            }
                                        });
                                    }
                                }}
                            >
                                <View style={styles.tripCardHeader}>
                                    <Text style={[styles.tripCardTitle, { color: colors.text }]}>
                                        {trip.tripName}
                                    </Text>
                                    {activeTab === 'upcoming' && (
                                        <View style={[styles.statusBadge, { backgroundColor: '#FFE5E5' }]}>
                                            <Text style={[styles.statusBadgeText, { color: '#FF4444' }]}>MỚI</Text>
                                        </View>
                                    )}
                                    {activeTab === 'past' && (
                                        <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                                            <Text style={[styles.statusBadgeText, { color: '#4CAF50' }]}>Hoàn thành</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.tripCardMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                            {tripDate.toLocaleDateString('vi-VN')}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                            {tripTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.tripCardMeta}>
                                    <View style={styles.metaItem}>
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                            {trip.destinations.length} điểm đến
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.tripCardMeta}>
                                    <Ionicons name="location" size={14} color="#4CAF50" />
                                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                        Vị trí hiện tại
                                    </Text>
                                </View>

                                <Pressable style={[styles.viewButton, { backgroundColor: colors.info }]}>
                                    <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
                                    <Text style={styles.viewButtonText}>Xem lại lịch trình</Text>
                                </Pressable>
                            </Pressable>
                        );
                    })}
                </View>
            );
        }

        // Empty states
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
                    <Pressable 
                        style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => router.push("/(modals)/ai-itinerary" as any)}
                    >
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

            {/* Floating Action Button */}
            <Pressable
                style={[styles.fab, { backgroundColor: colors.info }]}
                onPress={() => router.push('/(modals)/create-itinerary')}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </Pressable>
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
    bannerCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        gap: 10,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    bannerSubtitle: {
        fontSize: 12,
        marginBottom: 4,
    },
    bannerLink: {
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    listHeaderTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    aiButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tripCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 8,
    },
    tripCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tripCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    tripCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 4,
    },
    viewButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
