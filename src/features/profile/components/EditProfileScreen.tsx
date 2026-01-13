import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker } from '../hooks';
import { editProfileSchema, type EditProfileFormData } from '../schemas';
import { mockProfile } from '../services/mockProfile';
import { EditProfileFormRow } from './EditProfileFormRow';
import { EditProfileFormSection } from './EditProfileFormSection';
import { EditProfileHeader } from './EditProfileHeader';
import { InterestChips } from './InterestChips';
import { InterestsBottomSheet } from './InterestsBottomSheet';
import { ProfileFAB } from './ProfileFAB';

export function EditProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showImagePickerOptions } = useImagePicker({ aspect: [1, 1], quality: 0.8 });

    // React Hook Form setup with zod resolver
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            displayName: mockProfile.displayName,
            bio: mockProfile.bio ?? '',
            avatarUrl: mockProfile.avatarUrl,
            coverUrl: mockProfile.coverUrl,
            interests: [],
            isPrivate: false,
        },
    });

    const rawInterests = watch('interests');
    const watchedInterests = useMemo(() => rawInterests ?? [], [rawInterests]);
    const watchedBio = watch('bio') ?? '';
    const watchedIsPrivate = watch('isPrivate') ?? false;
    const watchedAvatarUrl = watch('avatarUrl');

    // Handlers
    const handleCancel = useCallback(() => {
        if (isDirty) {
            Alert.alert(
                'Hủy thay đổi?',
                'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn thoát?',
                [
                    { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
                    {
                        text: 'Hủy thay đổi',
                        style: 'destructive',
                        onPress: () => {
                            router.back();
                        },
                    },
                ]
            );
        } else {
            router.back();
        }
    }, [isDirty]);

    const onSubmit = async (data: EditProfileFormData) => {
        setIsSubmitting(true);
        try {
            // TODO: Replace with actual API call
            console.log('Saving profile:', data);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            router.back();
        } catch (error) {
            console.error('Failed to save profile:', error);
            Alert.alert(
                'Lỗi',
                'Không thể lưu thay đổi. Vui lòng thử lại.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeAvatar = useCallback(async () => {
        const result = await showImagePickerOptions();
        if (result) {
            setValue('avatarUrl', result.uri, { shouldDirty: true });
        }
    }, [setValue, showImagePickerOptions]);

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



    const handlePrivacyPress = useCallback(() => {
        setValue('isPrivate', !watchedIsPrivate, { shouldDirty: true });
    }, [setValue, watchedIsPrivate]);

    return (
        <GestureHandlerRootView style={styles.flex}>
            <SafeAreaView
                style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
                edges={['top']}
            >
                {/* Header */}
                <View style={[styles.headerWrapper, { backgroundColor: colors.card }]}>
                    <EditProfileHeader
                        title="Chỉnh sửa trang cá nhân"
                        onCancel={handleCancel}
                        onDone={handleSubmit(onSubmit)}
                        isLoading={isSubmitting}
                        isDoneDisabled={!isDirty}
                    />
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    <KeyboardAvoidingView
                        style={styles.flex}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Form Card */}
                            <View
                                style={[
                                    styles.formCard,
                                    { backgroundColor: colors.card },
                                ]}
                            >
                                {/* Name Section - Read Only with FAB */}
                                <EditProfileFormSection label="Tên">
                                    <View style={styles.nameRow}>
                                        <View
                                            style={[
                                                styles.nameField,
                                                styles.nameFieldFlex,
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
                                        <ProfileFAB onPress={handleChangeAvatar} absolute={false} />
                                    </View>
                                </EditProfileFormSection>

                                {/* Bio Section - Editable */}
                                <EditProfileFormSection label="Tiểu sử">
                                    <Controller
                                        control={control}
                                        name="bio"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <View>
                                                <TextInput
                                                    style={[
                                                        styles.bioInput,
                                                        {
                                                            color: colors.textPrimary,
                                                            backgroundColor: 'transparent',
                                                        },
                                                    ]}
                                                    placeholder="Viết tiểu sử..."
                                                    placeholderTextColor={colors.textSecondary}
                                                    multiline
                                                    maxLength={150}
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    textAlignVertical="top"
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
                </View>

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
    headerWrapper: {
        zIndex: 1,
    },
    mainContent: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Spacing.md,
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.xl,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.md,
    },
    nameFieldFlex: {
        flex: 1,
    },
    formCard: {
        borderRadius: BorderRadius.lg,
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
        minHeight: 80,
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
