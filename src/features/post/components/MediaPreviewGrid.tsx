import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import type { PickedFile } from '../services';

interface MediaPreviewGridProps {
    files: PickedFile[];
    onRemove: (fileId: string) => void;
}

/**
 * MediaPreviewGrid - Grid hiển thị preview ảnh/video đã chọn
 * Cho phép xoá từng file với nút X
 */
export function MediaPreviewGrid({ files, onRemove }: MediaPreviewGridProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];

    if (files.length === 0) {
        return null;
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {files.map((file) => (
                <View key={file.id} style={styles.imageWrapper}>
                    <Image
                        source={{ uri: file.uri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={[styles.removeButton, { backgroundColor: colors.background }]}
                        onPress={() => onRemove(file.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="close" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.md,
    },
    contentContainer: {
        gap: Spacing.sm,
        paddingHorizontal: 2,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.md,
    },
    removeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
});
