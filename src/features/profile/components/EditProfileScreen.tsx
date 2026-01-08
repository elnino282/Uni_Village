/**
 * EditProfileScreen Component
 * Screen for editing user profile information
 */

import { Avatar, Button, Input } from '@/shared/components/ui';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockProfile } from '../services/mockProfile';
import type { UpdateProfileRequest } from '../types';

export function EditProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // Form state initialized with current profile data
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        displayName: mockProfile.displayName,
        bio: mockProfile.bio ?? '',
        avatarUrl: mockProfile.avatarUrl,
        coverUrl: mockProfile.coverUrl,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handlers
    const handleBack = () => {
        router.back();
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // TODO: Call API to update profile
            console.log('Saving profile:', formData);
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

    const handleChangeCover = () => {
        // TODO: Open image picker for cover
        console.log('Change cover pressed');
    };

    const updateField = (field: keyof UpdateProfileRequest, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top']}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable
                    style={styles.backButton}
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Chỉnh sửa trang cá nhân
                </Text>
                <View style={styles.headerRight} />
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
                    {/* Cover Photo Section */}
                    <Pressable
                        style={[styles.coverSection, { backgroundColor: colors.muted }]}
                        onPress={handleChangeCover}
                    >
                        {formData.coverUrl ? (
                            <View style={styles.coverImage}>
                                {/* TODO: Add actual cover image */}
                            </View>
                        ) : (
                            <View style={styles.coverPlaceholder}>
                                <MaterialIcons name="add-a-photo" size={32} color={colors.icon} />
                                <Text style={[styles.coverText, { color: colors.icon }]}>
                                    Thêm ảnh bìa
                                </Text>
                            </View>
                        )}
                        <View style={[styles.editBadge, { backgroundColor: colors.tint }]}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                        </View>
                    </Pressable>

                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <Pressable style={styles.avatarWrapper} onPress={handleChangeAvatar}>
                            <Avatar
                                source={formData.avatarUrl}
                                name={formData.displayName}
                                size="xl"
                                style={styles.avatar}
                            />
                            <View style={[styles.avatarEditBadge, { backgroundColor: colors.tint }]}>
                                <MaterialIcons name="camera-alt" size={18} color="#fff" />
                            </View>
                        </Pressable>
                        <Text style={[styles.changePhotoText, { color: colors.tint }]}>
                            Thay đổi ảnh đại diện
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        {/* Display Name */}
                        <Input
                            label="Tên hiển thị"
                            value={formData.displayName}
                            onChangeText={(text) => updateField('displayName', text)}
                            placeholder="Nhập tên hiển thị"
                            maxLength={50}
                            containerStyle={styles.inputContainer}
                        />

                        {/* Username (read-only) */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                Tên người dùng
                            </Text>
                            <View
                                style={[
                                    styles.readOnlyField,
                                    { backgroundColor: colors.muted, borderColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.readOnlyText, { color: colors.icon }]}>
                                    @{mockProfile.username}
                                </Text>
                                <MaterialIcons name="lock" size={18} color={colors.icon} />
                            </View>
                            <Text style={[styles.hintText, { color: colors.icon }]}>
                                Tên người dùng không thể thay đổi
                            </Text>
                        </View>

                        {/* Bio */}
                        <Input
                            label="Tiểu sử"
                            value={formData.bio}
                            onChangeText={(text) => updateField('bio', text)}
                            placeholder="Viết gì đó về bản thân..."
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                            containerStyle={styles.inputContainer}
                            inputStyle={styles.bioInput}
                        />
                        <Text style={[styles.charCount, { color: colors.icon }]}>
                            {formData.bio?.length ?? 0}/200
                        </Text>
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <Button
                        title="Lưu thay đổi"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        onPress={handleSave}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    headerRight: {
        width: 44,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    coverSection: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    coverText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
    },
    editBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: -40,
        marginBottom: Spacing.lg,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        borderWidth: 4,
        borderColor: '#fff',
        ...Shadows.md,
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    changePhotoText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        marginTop: Spacing.sm,
    },
    formSection: {
        paddingHorizontal: Spacing.screenPadding,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        marginBottom: Spacing.xs,
    },
    readOnlyField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.inputPadding,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    readOnlyText: {
        fontSize: Typography.sizes.base,
    },
    hintText: {
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: Spacing.sm,
    },
    charCount: {
        fontSize: Typography.sizes.sm,
        textAlign: 'right',
        marginTop: -Spacing.sm,
    },
    footer: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
    },
});
