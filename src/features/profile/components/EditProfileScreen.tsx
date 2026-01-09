import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { editProfileSchema, type EditProfileFormData } from '../schemas';
import { mockProfile } from '../services/mockProfile';
import { EditProfileAvatarFAB } from './EditProfileAvatarFAB';
import { EditProfileFormRow } from './EditProfileFormRow';
import { EditProfileFormSection } from './EditProfileFormSection';
import { EditProfileHeader } from './EditProfileHeader';
import { InterestChips } from './InterestChips';
import { InterestsBottomSheet } from './InterestsBottomSheet';

export function EditProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // React Hook Form setup with zod resolver
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            displayName: mockProfile.displayName,
            bio: mockProfile.bio ?? '',
            avatarUrl: mockProfile.avatarUrl,
            coverUrl: mockProfile.coverUrl,
            interests: [],
            links: [],
            podcastUrl: '',
            isPrivate: false,
        },
    });

    const rawInterests = watch('interests');
    const watchedInterests = useMemo(() => rawInterests ?? [], [rawInterests]);
    const watchedBio = watch('bio') ?? '';
    const watchedIsPrivate = watch('isPrivate') ?? false;

    // Handlers
    const handleBack = () => {
        router.back();
    };

    const onSubmit = async (data: EditProfileFormData) => {
        setIsSubmitting(true);
        try {
            // TODO: Call API to update profile
            console.log('Saving profile:', data);
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.back();
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeAvatar = () => {
        // TODO: Open image picker for avatar
        console.log('Change avatar pressed');
    };

    const handleOpenInterests = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    const handleAddInterest = useCallback(
        (interest: string) => {
            const current = watchedInterests;
            if (!current.includes(interest) && current.length < 10) {
                setValue('interests', [...current, interest], { shouldDirty: true });
            }
        },
        [watchedInterests, setValue]
    );

    const handleRemoveInterest = useCallback(
        (interest: string) => {
            const current = watchedInterests;
            setValue(
                'interests',
                current.filter((i) => i !== interest),
                { shouldDirty: true }
            );
        },
        [watchedInterests, setValue]
    );

    const handleLinksPress = () => {
        // TODO: Navigate to links management screen
        console.log('Links pressed');
    };

    const handlePodcastPress = () => {
        // TODO: Open podcast URL input
        console.log('Podcast pressed');
    };

    const handlePrivacyPress = () => {
        // TODO: Navigate to privacy settings
        setValue('isPrivate', !watchedIsPrivate, { shouldDirty: true });
    };

    return (
        <GestureHandlerRootView style={styles.flex}>
            <SafeAreaView
                style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
                edges={['top']}
            >
                {/* Header - white background */}
                <View style={{ backgroundColor: colors.card }}>
                    <EditProfileHeader
                        title="Chỉnh sửa trang cá nhân"
                        onCancel={handleBack}
                        onDone={handleSubmit(onSubmit)}
                        isLoading={isSubmitting}
                    />
                </View>

                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Avatar FAB */}
                        <EditProfileAvatarFAB
                            avatarUrl={mockProfile.avatarUrl}
                            displayName={mockProfile.displayName}
                            onPress={handleChangeAvatar}
                        />

                        {/* Form Card */}
                        <View
                            style={[
                                styles.formCard,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            {/* Name Section */}
                            <EditProfileFormSection label="Tên">
                                <View
                                    style={[
                                        styles.nameField,
                                        { backgroundColor: colors.muted },
                                    ]}
                                >
                                    <MaterialIcons
                                        name="lock"
                                        size={16}
                                        color={colors.textSecondary}
                                    />
                                    <Controller
                                        control={control}
                                        name="displayName"
                                        render={({ field: { value } }) => (
                                            <Text
                                                style={[
                                                    styles.nameText,
                                                    { color: colors.textPrimary },
                                                ]}
                                            >
                                                {value} (@{mockProfile.username})
                                            </Text>
                                        )}
                                    />
                                </View>
                            </EditProfileFormSection>

                            {/* Bio Section */}
                            <EditProfileFormSection label="Tiểu sử">
                                <Controller
                                    control={control}
                                    name="bio"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <View>
                                            <TextInput
                                                style={[
                                                    styles.bioInput,
                                                    { color: colors.textPrimary },
                                                ]}
                                                placeholder="Viết tiểu sử..."
                                                placeholderTextColor={colors.textSecondary}
                                                multiline
                                                maxLength={150}
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                            />
                                            <Text
                                                style={[
                                                    styles.charCount,
                                                    { color: colors.textSecondary },
                                                ]}
                                            >
                                                {watchedBio.length}/150
                                            </Text>
                                        </View>
                                    )}
                                />
                                {errors.bio && (
                                    <Text style={[styles.errorText, { color: colors.error }]}>
                                        {errors.bio.message}
                                    </Text>
                                )}
                            </EditProfileFormSection>

                            {/* Interests Section */}
                            <EditProfileFormSection label="Sở thích">
                                <InterestChips
                                    interests={watchedInterests}
                                    onRemove={handleRemoveInterest}
                                    onAddPress={handleOpenInterests}
                                />
                            </EditProfileFormSection>

                            {/* Links Section */}
                            <EditProfileFormRow
                                label="Liên kết"
                                onPress={handleLinksPress}
                            />

                            {/* Podcast Section */}
                            <EditProfileFormSection label="Podcast" showBorder>
                                <Pressable onPress={handlePodcastPress}>
                                    <Text
                                        style={[
                                            styles.addActionText,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        + Liên kết đến podcast của bạn
                                    </Text>
                                </Pressable>
                            </EditProfileFormSection>

                            {/* Privacy Section */}
                            <View style={styles.privacySection}>
                                <EditProfileFormRow
                                    label="Quyền riêng tư trang cá nhân"
                                    value={watchedIsPrivate ? 'Riêng tư' : 'Công khai'}
                                    onPress={handlePrivacyPress}
                                    showBorder={false}
                                />
                                <Text
                                    style={[
                                        styles.privacyHint,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    {watchedIsPrivate
                                        ? 'Chỉ những người theo dõi mới có thể xem nội dung của bạn'
                                        : 'Mọi người đều có thể xem nội dung của bạn'}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Interests Bottom Sheet */}
                <InterestsBottomSheet
                    ref={bottomSheetRef}
                    selectedInterests={watchedInterests}
                    onSelect={handleAddInterest}
                    onRemove={handleRemoveInterest}
                />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Spacing.xl + Spacing.lg,
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.xl,
    },
    formCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.card,
    },
    nameField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    nameText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.normal,
    },
    bioInput: {
        fontSize: Typography.sizes.md,
        minHeight: 60,
        textAlignVertical: 'top',
        padding: 0,
    },
    charCount: {
        fontSize: Typography.sizes.sm,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    errorText: {
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
    },
    addActionText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.normal,
    },
    privacySection: {
        paddingBottom: Spacing.sm,
    },
    privacyHint: {
        fontSize: Typography.sizes.sm,
        paddingHorizontal: Spacing.md,
        marginTop: -Spacing.sm,
    },
});
