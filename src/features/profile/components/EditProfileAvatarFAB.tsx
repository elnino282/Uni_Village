import { Avatar } from '@/shared/components/ui';
import { Colors, Shadows, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export interface EditProfileAvatarFABProps {
    avatarUrl?: string;
    displayName?: string;
    onPress: () => void;
}

export function EditProfileAvatarFAB({
    avatarUrl,
    displayName,
    onPress,
}: EditProfileAvatarFABProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <Pressable style={styles.container} onPress={onPress}>
            {/* Outer blue ring */}
            <View style={[styles.outerRing, { backgroundColor: colors.fabBlue }]}>
                {/* Inner circle with avatar */}
                <View style={[styles.innerCircle, { backgroundColor: colors.fabInner }]}>
                    <Avatar
                        source={avatarUrl}
                        name={displayName}
                        size="lg"
                        style={styles.avatar}
                    />
                </View>
            </View>

            {/* Camera icon overlay */}
            <View style={[styles.cameraOverlay, { backgroundColor: colors.fabBlue }]}>
                <MaterialIcons name="camera-alt" size={14} color="#fff" />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.screenPadding,
        zIndex: 10,
    },
    outerRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.lg,
    },
    innerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
});
