/**
 * Auth Validation Schemas
 * Zod schemas for login and register form validation
 */

import { z } from 'zod';

export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Vui lòng nhập email hoặc số điện thoại'),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Vui lòng nhập họ và tên'),
    identifier: z
        .string()
        .min(1, 'Vui lòng nhập email hoặc số điện thoại'),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z
        .string()
        .min(1, 'Vui lòng xác nhận mật khẩu'),
    termsAccepted: z
        .boolean()
        .refine(val => val === true, 'Bạn phải đồng ý với điều khoản sử dụng'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
