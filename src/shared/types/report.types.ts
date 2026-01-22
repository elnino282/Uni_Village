/**
 * Report Types
 * 
 * Types and interfaces for the Report API system.
 * Matches backend ReportController, ReportService, and DTOs.
 */

/**
 * Report status enum
 * Represents the current state of a report
 */
export enum ReportStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
}

/**
 * Report target type
 * Defines what type of entity is being reported
 */
export enum ReportTargetType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  USER = 'USER',
  CONVERSATION = 'CONVERSATION',
}

/**
 * Report reason enum
 * Common report reasons for better UX
 */
export enum ReportReason {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  HARASSMENT = 'HARASSMENT',
  FALSE_INFORMATION = 'FALSE_INFORMATION',
  OTHER = 'OTHER',
}

/**
 * Create Report Request
 * Data required to create a new report
 */
export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
}

/**
 * Report Response
 * Complete report information returned from the backend
 */
export interface ReportResponse {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  status: ReportStatus;
  reporterId: number;
  reporterUsername: string;
  reporterFullName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Report helper type - reason with label for UI display
 */
export interface ReportReasonOption {
  value: ReportReason;
  label: string;
  description?: string;
}

/**
 * Predefined report reason options
 */
export const REPORT_REASON_OPTIONS: ReportReasonOption[] = [
  {
    value: ReportReason.SPAM,
    label: 'Spam',
    description: 'Nội dung spam hoặc quảng cáo không mong muốn',
  },
  {
    value: ReportReason.INAPPROPRIATE,
    label: 'Nội dung không phù hợp',
    description: 'Nội dung không phù hợp với cộng đồng',
  },
  {
    value: ReportReason.HARASSMENT,
    label: 'Quấy rối',
    description: 'Quấy rối hoặc bắt nạt người khác',
  },
  {
    value: ReportReason.FALSE_INFORMATION,
    label: 'Thông tin sai lệch',
    description: 'Thông tin giả mạo hoặc sai sự thật',
  },
  {
    value: ReportReason.OTHER,
    label: 'Khác',
    description: 'Lý do khác',
  },
];
