/**
 * ProfileActionButtons Component
 * Side-by-side Edit and Share profile buttons
 */

import { Button } from '@/shared/components/ui';
import { Spacing } from '@/shared/constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileActionButtonsProps {
    onEditPress?: () => void;
    onSharePress?: () => void;
}

export function ProfileActionButtons({
    onEditPress,
    onSharePress,
}: ProfileActionButtonsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.buttonWrapper}>
                <Button
                    title="Chỉnh sửa trang cá nhân"
                    variant="primary"
                    size="sm"
                    fullWidth
                    onPress={onEditPress}
                />
            </View>
            <View style={styles.buttonWrapper}>
                <Button
                    title="Chia sẻ trang cá nhân"
                    variant="primary"
                    size="sm"
                    fullWidth
                    onPress={onSharePress}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    buttonWrapper: {
        flex: 1,
    },
});
