/**
 * NavigationControls - Navigation mode control buttons
 *
 * Displays exit and voice buttons during active navigation.
 * Extracted from MapScreen for better component separation.
 */

import { Spacing } from '@/shared/constants/spacing';
import { Colors, Shadows } from '@/shared/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { memo } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NavigationControlsProps {
    /** Callback when exit button is pressed */
    onExit: () => void;
    /** Callback when voice button is pressed */
    onVoiceToggle?: () => void;
    /** Whether voice guidance is enabled */
    voiceEnabled?: boolean;
    /** Color scheme */
    colorScheme?: 'light' | 'dark';
}

export const NavigationControls = memo(function NavigationControls({
    onExit,
    onVoiceToggle,
    voiceEnabled = true,
    colorScheme = 'light',
}: NavigationControlsProps) {
    const insets = useSafeAreaInsets();
    const colors = Colors[colorScheme];

    // Bottom position accounts for safe area + some padding
    const bottomPosition = Spacing.screenPadding + Math.max(insets.bottom, 20) + 20;

    const handleVoicePress = () => {
        if (onVoiceToggle) {
            onVoiceToggle();
        } else {
            Alert.alert('Giọng nói', voiceEnabled ? 'Đã tắt dẫn đường giọng nói' : 'Đã bật dẫn đường giọng nói');
        }
    };

    return (
        <View style={[styles.container, { bottom: bottomPosition }]}>
            {/* Exit Navigation Button */}
            <TouchableOpacity
                style={[styles.button, styles.exitButton]}
                onPress={onExit}
                activeOpacity={0.8}
            >
                <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Voice Toggle Button */}
            <TouchableOpacity
                style={[styles.button, styles.voiceButton]}
                onPress={handleVoicePress}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name={voiceEnabled ? 'volume-up' : 'volume-off'}
                    size={24}
                    color="#fff"
                />
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: Spacing.screenPadding,
        alignItems: 'center',
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        ...Shadows.lg,
    },
    exitButton: {
        backgroundColor: '#EF4444',
    },
    voiceButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
});
