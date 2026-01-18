/**
 * RegisterScreen
 * Registration screen with full form validation
 */

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {
    AuthDivider,
    AuthHeader,
    AuthInput,
    PrimaryButton,
    SocialAuthButtons,
    TermsRow,
} from '../components';
import { registerSchema, type RegisterFormData } from '../schemas';
import { authService } from '../services';

export function RegisterScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, dirtyFields },
        setValue,
        watch,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            identifier: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
        },
    });

    const termsAccepted = watch('termsAccepted');

    const onSubmit = useCallback(async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            // Tách name thành firstname và lastname
            const nameParts = data.name.trim().split(' ');
            const firstname = nameParts[0];
            const lastname = nameParts.slice(1).join(' ') || firstname; // Nếu chỉ có 1 từ, dùng làm cả firstname và lastname

            // Sử dụng identifier làm email và username
            const result = await authService.register(
                firstname,
                lastname,
                data.identifier,
                data.identifier.split('@')[0], // username từ email
                data.password
            );

            if (result.success) {
                // Navigate to main app
                router.replace({ pathname: '/(tabs)/map' });
            } else {
                Alert.alert('Lỗi', result.message || 'Đã có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Register error:', error);
            Alert.alert('Lỗi', 'Không thể đăng ký. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const handleLogin = useCallback(() => {
        router.push({ pathname: '/(auth)/login' });
    }, []);

    const handleGoogleLogin = useCallback(async () => {
        await authService.loginWithGoogle();
    }, []);

    const handleFacebookLogin = useCallback(async () => {
        await authService.loginWithFacebook();
    }, []);

    const handleTermsPress = useCallback(() => {
        // TODO: Navigate to terms screen or open WebView
        Alert.alert('Điều khoản sử dụng', 'Chức năng đang được phát triển');
    }, []);

    const handlePrivacyPress = useCallback(() => {
        // TODO: Navigate to privacy screen or open WebView
        Alert.alert('Chính sách bảo mật', 'Chức năng đang được phát triển');
    }, []);

    const toggleTerms = useCallback(() => {
        setValue('termsAccepted', !termsAccepted, { shouldValidate: true });
    }, [setValue, termsAccepted]);

    return (
        <View style={styles.container}>
            {/* Immersive status bar */}
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* Gradient Background - extends behind status bar */}
            <LinearGradient
                colors={[
                    colors.authGradientStart,
                    colors.authGradientMid,
                    colors.authGradientEnd,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    {/* Header */}
                    <AuthHeader title="Đăng ký" />

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput
                                    placeholder="Họ và tên"
                                    leftIconName="person-outline"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize="words"
                                    error={dirtyFields.name ? errors.name?.message : undefined}
                                />
                            )}
                        />

                        {/* Email/Phone Input */}
                        <Controller
                            control={control}
                            name="identifier"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput
                                    placeholder="Email / Số điện thoại"
                                    leftIconName="mail-outline"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={dirtyFields.identifier ? errors.identifier?.message : undefined}
                                />
                            )}
                        />

                        {/* Password Input */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput
                                    placeholder="Mật khẩu"
                                    leftIconName="lock-closed-outline"
                                    isPassword
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={dirtyFields.password ? errors.password?.message : undefined}
                                />
                            )}
                        />

                        {/* Confirm Password Input */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput
                                    placeholder="Xác nhận mật khẩu"
                                    leftIconName="lock-closed-outline"
                                    isPassword
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={dirtyFields.confirmPassword ? errors.confirmPassword?.message : undefined}
                                />
                            )}
                        />

                        {/* Terms Checkbox */}
                        <TermsRow
                            checked={termsAccepted}
                            onToggle={toggleTerms}
                            onTermsPress={handleTermsPress}
                            onPrivacyPress={handlePrivacyPress}
                            error={errors.termsAccepted?.message}
                        />

                        {/* Register Button */}
                        <PrimaryButton
                            title="Đăng ký"
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid}
                            loading={isSubmitting}
                        />
                    </View>

                    {/* Divider */}
                    <AuthDivider label="Hoặc tiếp tục với" />

                    {/* Social Buttons */}
                    <SocialAuthButtons
                        onGooglePress={handleGoogleLogin}
                        onFacebookPress={handleFacebookLogin}
                    />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Đã có tài khoản?
                        </Text>
                        <Pressable onPress={handleLogin}>
                            <Text style={[styles.footerLink, { color: colors.authLinkText }]}>
                                Đăng nhập ngay
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 48, // Account for status bar
        paddingBottom: 24,
        flexGrow: 1,
    },
    form: {
        gap: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        gap: 4,
    },
    footerText: {
        fontSize: 16,
    },
    footerLink: {
        fontSize: 16,
        fontWeight: '500',
    },
});
