import * as ImagePicker from 'expo-image-picker';
import type { FileUpload } from '@/lib/api';

export interface PickedFile extends FileUpload {
    id: string;
}

export const fileUploadService = {
    pickImages: async (allowMultiple = true): Promise<PickedFile[]> => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            throw new Error('Permission to access media library is required');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: allowMultiple,
            quality: 0.8,
            allowsEditing: !allowMultiple,
        });

        if (result.canceled) {
            return [];
        }

        return result.assets.map((asset, index) => ({
            id: `image-${Date.now()}-${index}`,
            uri: asset.uri,
            name: `photo-${Date.now()}-${index}.jpg`,
            type: 'image/jpeg',
        }));
    },

    pickVideos: async (): Promise<PickedFile[]> => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            throw new Error('Permission to access media library is required');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsMultipleSelection: false,
            quality: 0.8,
        });

        if (result.canceled) {
            return [];
        }

        return result.assets.map((asset, index) => ({
            id: `video-${Date.now()}-${index}`,
            uri: asset.uri,
            name: `video-${Date.now()}-${index}.mp4`,
            type: 'video/mp4',
        }));
    },

    takePhoto: async (): Promise<PickedFile | null> => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            throw new Error('Permission to access camera is required');
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled) {
            return null;
        }

        return {
            id: `photo-${Date.now()}`,
            uri: result.assets[0].uri,
            name: `photo-${Date.now()}.jpg`,
            type: 'image/jpeg',
        };
    },

    pickMedia: async (allowMultiple = true): Promise<PickedFile[]> => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            throw new Error('Permission to access media library is required');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: allowMultiple,
            quality: 0.8,
        });

        if (result.canceled) {
            return [];
        }

        return result.assets.map((asset, index) => {
            const isVideo = asset.type === 'video';
            return {
                id: `media-${Date.now()}-${index}`,
                uri: asset.uri,
                name: `${isVideo ? 'video' : 'photo'}-${Date.now()}-${index}.${isVideo ? 'mp4' : 'jpg'}`,
                type: isVideo ? 'video/mp4' : 'image/jpeg',
            };
        });
    },

    pickAudio: async (): Promise<PickedFile | null> => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            throw new Error('Permission to access media library is required');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsMultipleSelection: false,
        });

        if (result.canceled) {
            return null;
        }

        return {
            id: `audio-${Date.now()}`,
            uri: result.assets[0].uri,
            name: `audio-${Date.now()}.mp3`,
            type: 'audio/mpeg',
        };
    },
};
