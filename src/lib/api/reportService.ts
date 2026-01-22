/**
 * Report Service
 * 
 * API service for creating and managing reports.
 * Handles reporting posts, comments, users, and conversations.
 */

import { API_ENDPOINTS } from './endpoints';
import { apiClient } from './client';
import type { 
  CreateReportRequest, 
  ReportResponse 
} from '@/shared/types/report.types';
import type { ApiResponse } from '@/shared/types';

/**
 * Create a new report
 * 
 * @param request - Report creation data
 * @returns Promise with report response
 * @throws ApiError with specific error codes:
 *   - DUPLICATE_REPORT: User has already reported this target
 *   - SELF_REPORT: User cannot report themselves
 *   - INVALID_REPORT_TARGET: Target does not exist or is invalid
 */
export async function createReport(
  request: CreateReportRequest
): Promise<ReportResponse> {
  const response = await apiClient.post<ApiResponse<ReportResponse>>(
    API_ENDPOINTS.REPORTS.CREATE,
    request
  );
  
  return response.data.data;
}

/**
 * Helper function to create a post report
 */
export async function reportPost(
  postId: number,
  reason: string
): Promise<ReportResponse> {
  return createReport({
    targetType: 'POST' as any,
    targetId: postId,
    reason,
  });
}

/**
 * Helper function to create a comment report
 */
export async function reportComment(
  commentId: number,
  reason: string
): Promise<ReportResponse> {
  return createReport({
    targetType: 'COMMENT' as any,
    targetId: commentId,
    reason,
  });
}

/**
 * Helper function to create a user report
 */
export async function reportUser(
  userId: number,
  reason: string
): Promise<ReportResponse> {
  return createReport({
    targetType: 'USER' as any,
    targetId: userId,
    reason,
  });
}

/**
 * Helper function to create a conversation report
 */
export async function reportConversation(
  conversationId: number,
  reason: string
): Promise<ReportResponse> {
  return createReport({
    targetType: 'CONVERSATION' as any,
    targetId: conversationId,
    reason,
  });
}
