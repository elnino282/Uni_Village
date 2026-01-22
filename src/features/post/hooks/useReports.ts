/**
 * Report Hooks
 * 
 * React Query hooks for reporting content (posts, comments, users, conversations).
 */

import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { reportUser as reportUserAPI, reportConversation as reportConversationAPI } from '@/lib/api';
import { ApiError } from '@/lib/errors/ApiError';

/**
 * Hook for reporting a comment
 */
export function useReportComment() {
  return useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: string; reason: string }) => {
      try {
        const response = await reportCommentAPI(Number(commentId), reason);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle specific backend errors
          if (error.code === 'DUPLICATE_REPORT') {
            Alert.alert('Thông báo', 'Bạn đã báo cáo nội dung này rồi');
          } else if (error.code === 'SELF_REPORT') {
            Alert.alert('Thông báo', 'Bạn không thể báo cáo nội dung của chính mình');
          } else if (error.code === 'INVALID_REPORT_TARGET') {
            Alert.alert('Lỗi', 'Không tìm thấy nội dung cần báo cáo');
          } else {
            Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo');
          }
        } else {
          Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi báo cáo');
        }
        throw error;
      }
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi thành công');
    },
  });
}

/**
 * Hook for reporting a user
 */
export function useReportUser() {
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      try {
        const response = await reportUserAPI(Number(userId), reason);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle specific backend errors
          if (error.code === 'DUPLICATE_REPORT') {
            Alert.alert('Thông báo', 'Bạn đã báo cáo người dùng này rồi');
          } else if (error.code === 'SELF_REPORT') {
            Alert.alert('Thông báo', 'Bạn không thể báo cáo chính mình');
          } else if (error.code === 'INVALID_REPORT_TARGET') {
            Alert.alert('Lỗi', 'Không tìm thấy người dùng cần báo cáo');
          } else {
            Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo');
          }
        } else {
          Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi báo cáo');
        }
        throw error;
      }
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi thành công');
    },
  });
}

/**
 * Hook for reporting a conversation
 */
export function useReportConversation() {
  return useMutation({
    mutationFn: async ({ conversationId, reason }: { conversationId: string; reason: string }) => {
      try {
        const response = await reportConversationAPI(Number(conversationId), reason);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle specific backend errors
          if (error.code === 'DUPLICATE_REPORT') {
            Alert.alert('Thông báo', 'Bạn đã báo cáo cuộc trò chuyện này rồi');
          } else if (error.code === 'SELF_REPORT') {
            Alert.alert('Thông báo', 'Bạn không thể báo cáo cuộc trò chuyện của chính mình');
          } else if (error.code === 'INVALID_REPORT_TARGET') {
            Alert.alert('Lỗi', 'Không tìm thấy cuộc trò chuyện cần báo cáo');
          } else {
            Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo');
          }
        } else {
          Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi báo cáo');
        }
        throw error;
      }
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi thành công');
    },
  });
}
