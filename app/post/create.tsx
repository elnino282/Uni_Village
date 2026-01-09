import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/ui';
import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

/**
 * Create Post modal screen
 */
export default function CreatePostScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // TODO: Implement actual post creation API call
    console.log('Creating post with content:', content);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    router.back();
  };

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.sm,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Tạo bài viết
        </Text>

        <Button
          title="Đăng"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
          size="sm"
          variant={canSubmit ? 'primary' : 'outline'}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text,
            },
          ]}
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom toolbar */}
      <View
        style={[
          styles.toolbar,
          {
            paddingBottom: insets.bottom + Spacing.sm,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity style={styles.toolbarButton}>
          <MaterialIcons name="image" size={24} color={colors.actionBlue} />
          <Text style={[styles.toolbarText, { color: colors.actionBlue }]}>
            Ảnh
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton}>
          <MaterialIcons name="location-on" size={24} color={colors.actionBlue} />
          <Text style={[styles.toolbarText, { color: colors.actionBlue }]}>
            Vị trí
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton}>
          <MaterialIcons name="tag" size={24} color={colors.actionBlue} />
          <Text style={[styles.toolbarText, { color: colors.actionBlue }]}>
            Gắn thẻ
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg, // 18px
    fontWeight: Typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
  },
  textInput: {
    fontSize: Typography.sizes.base, // 16px
    lineHeight: 24,
    minHeight: 200,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.lg,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  toolbarText: {
    fontSize: Typography.sizes.md, // 14px
    fontWeight: Typography.weights.medium,
  },
});
