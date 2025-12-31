/**
 * API Types
 * Types for API requests and responses
 */

import type { PaginationParams } from './common.types';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request options
 */
export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    timeout?: number;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort options
 */
export interface SortOptions {
    field: string;
    direction: SortDirection;
}

/**
 * Filter operator
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

/**
 * Filter condition
 */
export interface FilterCondition {
    field: string;
    operator: FilterOperator;
    value: unknown;
}

/**
 * Query options combining pagination, sort, and filter
 */
export interface QueryOptions extends PaginationParams {
    sort?: SortOptions;
    filters?: FilterCondition[];
    search?: string;
}

/**
 * Mutation result
 */
export interface MutationResult<T> {
    data?: T;
    error?: string;
    success: boolean;
}
