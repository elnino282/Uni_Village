import { Stack } from 'expo-router';

export default function ModalsLayout() {
    return (
        <Stack
            screenOptions={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: false, // Disable swipe to dismiss
                animation: 'slide_from_bottom',
            }}
        >
            <Stack.Screen 
                name="create-itinerary" 
                options={{
                    gestureEnabled: false,
                    presentation: 'fullScreenModal', // Full screen to hide previous screen
                }}
            />
            <Stack.Screen 
                name="select-destinations" 
                options={{
                    gestureEnabled: false,
                    presentation: 'fullScreenModal', // Full screen to hide previous screen
                }}
            />
            <Stack.Screen 
                name="itinerary-success" 
                options={{
                    gestureEnabled: false,
                    presentation: 'fullScreenModal',
                }}
            />
        </Stack>
    );
}
