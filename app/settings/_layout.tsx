/**
 * Settings Layout
 * Stack navigator for settings screens
 */

import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="language" />
            <Stack.Screen name="help" />
            <Stack.Screen name="about" />
        </Stack>
    );
}
