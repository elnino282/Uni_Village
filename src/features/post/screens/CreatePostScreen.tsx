import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import { useCreateCommunityPost } from '@/features/community/hooks/useCommunityPosts';
import { useCreatePost } from '../hooks';
import { fileUploadService, type PickedFile } from '../services';

import { ChooseChannelSheet } from '../components/ChooseChannelSheet';
import { ChooseItinerarySheet } from '../components/ChooseItinerarySheet';
import { PostVisibilityDropdown } from '../components/PostVisibilityDropdown';
import { SelectedChannelCard } from '../components/SelectedChannelCard';
import { SelectedItineraryCard } from '../components/SelectedItineraryCard';
import type {
    ChannelForSelection,
    ChannelVisibility,
    CreatePostTab,
    ItineraryForSelection,
} from '../types/createPost.types';

interface CreatePostScreenProps {
    initialTab?: CreatePostTab;
}

/**
 * Create Post Screen
 * Context-aware post creation based on initialTab
 */
export function CreatePostScreen({ initialTab = 'post' }: CreatePostScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // State
    const [activeTab, setActiveTab] = useState<CreatePostTab>(initialTab);
    const [postContent, setPostContent] = useState('');
    const [channelContent, setChannelContent] = useState('');
    const [itineraryContent, setItineraryContent] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<ChannelForSelection | null>(null);
    const [selectedItinerary, setSelectedItinerary] = useState<ItineraryForSelection | null>(null);
    const [postVisibility, setPostVisibility] = useState<ChannelVisibility>('public');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);

    // Bottom sheet refs
    const channelSheetRef = useRef<BottomSheet>(null);
    const itinerarySheetRef = useRef<BottomSheet>(null);

    const { mutateAsync: createCommunityPost, isPending: isCreating } = useCreateCommunityPost();
    const { mutateAsync: createRealPost, isPending: isCreatingRealPost } = useCreatePost();

    const canSubmit = useMemo(() => {
        if (isSubmitting || isCreating || isCreatingRealPost) return false;
        switch (activeTab) {
            case 'post':
                return postContent.trim().length > 0 || selectedFiles.length > 0;
            case 'channel':
                return !!selectedChannel;
            case 'itinerary':
                return !!selectedItinerary;
            default:
                return false;
        }
    }, [activeTab, postContent, selectedChannel, selectedItinerary, isSubmitting, isCreating, isCreatingRealPost, selectedFiles]);

    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const handleClose = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.back();
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        try {
            if (activeTab === 'post') {
                await createRealPost({
                    content: postContent,
                    postType: 'EXPERIENCE',
                    visibility: postVisibility === 'public' ? 'PUBLIC' : 'PRIVATE',
                    files: selectedFiles,
                });
            } else {
                await createCommunityPost({
                    content: activeTab === 'channel' ? channelContent : itineraryContent,
                    visibility: 'public',
                });
            }

            setIsSubmitting(false);
            router.back();
        } catch (error) {
            console.error('Failed to create post:', error);
            setIsSubmitting(false);
        }
    };

    const openChannelSheet = useCallback(() => {
        channelSheetRef.current?.expand();
    }, []);

    const closeChannelSheet = useCallback(() => {
        channelSheetRef.current?.close();
    }, []);

    const openItinerarySheet = useCallback(() => {
        itinerarySheetRef.current?.expand();
    }, []);

    const closeItinerarySheet = useCallback(() => {
        itinerarySheetRef.current?.close();
    }, []);

    const handleChannelSelect = useCallback((channel: ChannelForSelection) => {
        setSelectedChannel(channel);
        closeChannelSheet();
    }, [closeChannelSheet]);

    const handleItinerarySelect = useCallback((itinerary: ItineraryForSelection) => {
        setSelectedItinerary(itinerary);
        closeItinerarySheet();
    }, [closeItinerarySheet]);

    // Get header title based on initialTab
    const getHeaderTitle = () => {
        switch (initialTab) {
            case 'post':
                return 'Tạo bài viết';
            case 'channel':
                return 'Chia sẻ Channel';
            case 'itinerary':
                return 'Chia sẻ lịch trình';
            default:
                return 'Tạo bài viết';
        }
    };

    // Auto-open bottom sheets when initialTab is channel or itinerary
    useEffect(() => {
        if (initialTab === 'channel' && !selectedChannel) {
            // Small delay to ensure bottom sheet is mounted
            setTimeout(() => {
                openChannelSheet();
            }, 300);
        } else if (initialTab === 'itinerary' && !selectedItinerary) {
            setTimeout(() => {
                openItinerarySheet();
            }, 300);
        }
    }, [initialTab]);



    const getPlaceholder = () => {
        switch (activeTab) {
            case 'post':
                return 'Chia sẻ cảm nghĩ của bạn…';
            case 'channel':
                return 'Viết gì đó cho Channel này…';
            case 'itinerary':
                return 'Mô tả ngắn về lịch trình (tuỳ chọn)…';
            default:
                return '';
        }
    };

    const getCurrentContent = () => {
        switch (activeTab) {
            case 'post':
                return postContent;
            case 'channel':
                return channelContent;
            case 'itinerary':
                return itineraryContent;
            default:
                return '';
        }
    };

    const setCurrentContent = (text: string) => {
        switch (activeTab) {
            case 'post':
                setPostContent(text);
                break;
            case 'channel':
                setChannelContent(text);
                break;
            case 'itinerary':
                setItineraryContent(text);
                break;
        }
    };

    const renderEmptyState = () => {
        if (activeTab === 'channel' && !selectedChannel) {
            return (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.chipBackground }]}>
                        <Text style={[styles.emptyIconText, { color: colors.textSecondary }]}>
                            #
                        </Text>
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                        Chưa chọn Channel
                    </Text>
                    <Button
                        title="Chọn Channel"
                        onPress={openChannelSheet}
                        variant="primary"
                        size="md"
                    />
                </View>
            );
        }

        if (activeTab === 'itinerary' && !selectedItinerary) {
            return (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.chipBackground }]}>
                        <MaterialIcons
                            name="event-note"
                            size={32}
                            color={colors.textSecondary}
                        />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                        Chưa chọn lịch trình
                    </Text>
                    <Button
                        title="Chọn lịch trình"
                        onPress={openItinerarySheet}
                        variant="primary"
                        size="md"
                    />
                </View>
            );
        }

        return null;
    };

    const renderSelectedContent = () => {
        if (activeTab === 'channel' && selectedChannel) {
            return (
                <View style={styles.selectedContent}>
                    <SelectedChannelCard
                        channel={selectedChannel}
                        onChangeChannel={openChannelSheet}
                    />
                </View>
            );
        }

        if (activeTab === 'itinerary' && selectedItinerary) {
            return (
                <View style={styles.selectedContent}>
                    <SelectedItineraryCard
                        itinerary={selectedItinerary}
                        onChangeItinerary={openItinerarySheet}
                    />
                </View>
            );
        }

        return null;
    };

    const shouldShowEmptyState =
        (activeTab === 'channel' && !selectedChannel) ||
        (activeTab === 'itinerary' && !selectedItinerary);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + Spacing.sm,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {getHeaderTitle()}
                </Text>

                <Button
                    title="Đăng"
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    loading={isSubmitting}
                    size="sm"
                    variant={canSubmit ? 'primary' : 'outline'}
                />
            </View>

            {/* Content */}
            <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >
                        {/* Text Input - always shown unless empty state */}
                        {!shouldShowEmptyState && (
                            <>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        { color: colors.text },
                                    ]}
                                    placeholder={getPlaceholder()}
                                    placeholderTextColor={colors.textSecondary}
                                    value={getCurrentContent()}
                                    onChangeText={setCurrentContent}
                                    multiline
                                    autoFocus={activeTab === 'post'}
                                    textAlignVertical="top"
                                />
                            </>
                        )}

                        {/* Empty state for Channel/Itinerary */}
                        {renderEmptyState()}

                        {/* Selected Channel/Itinerary cards */}
                        {renderSelectedContent()}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            {/* Bottom toolbar */}
            <View
                style={[
                    styles.toolbar,
                    {
                        paddingBottom: insets.bottom + Spacing.sm,
                        borderTopColor: colors.border,
                        backgroundColor: colors.background,
                    },
                ]}
            >
                <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={async () => {
                        try {
                            const files = await fileUploadService.pickImages(true);
                            setSelectedFiles(prev => [...prev, ...files]);
                        } catch (error) {
                            console.error('Failed to pick images:', error);
                        }
                    }}
                >
                    <MaterialIcons name="image" size={24} color="#6A7282" />
                    <Text style={[styles.toolbarText, { color: '#6A7282' }]}>
                        Ảnh {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarButton}>
                    <MaterialIcons name="location-on" size={24} color="#6A7282" />
                    <Text style={[styles.toolbarText, { color: '#6A7282' }]}>
                        Vị trí
                    </Text>
                </TouchableOpacity>

                {activeTab === 'post' && (
                    <PostVisibilityDropdown
                        visibility={postVisibility}
                        onVisibilityChange={setPostVisibility}
                    />
                )}
            </View>

            {/* Bottom Sheets */}
            <ChooseChannelSheet
                ref={channelSheetRef}
                onSelect={handleChannelSelect}
            />
            <ChooseItinerarySheet
                ref={itinerarySheetRef}
                onSelect={handleItinerarySelect}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.screenPadding,
        flexGrow: 1,
    },
    textInput: {
        fontSize: Typography.sizes.base,
        lineHeight: 24,
        minHeight: 120,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.md,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    emptyIconText: {
        fontSize: 32,
        fontWeight: Typography.weights.bold,
    },
    emptyTitle: {
        fontSize: Typography.sizes.base,
        marginBottom: Spacing.sm,
    },
    selectedContent: {
        marginTop: Spacing.md,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        gap: Spacing.lg,
    },
    toolbarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    toolbarText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
    },
});
