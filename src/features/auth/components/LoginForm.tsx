/**
 * LoginForm Component
 * Form for user login
 */

import { Button, Input } from '@/shared/components/ui';
import { Colors } from '@/shared/constants';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLogin } from '../hooks/useLogin';
import { authService } from '../services/authService';

interface LoginFormProps {
    onSuccess?: () => void;
    onRegisterPress?: () => void;
}

export function LoginForm({ onSuccess, onRegisterPress }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const { login, isLoading, error } = useLogin();

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!authService.validateEmail(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        login(
            { email, password },
            {
                onSuccess: () => {
                    onSuccess?.();
                },
            }
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
                <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    error={errors.password}
                    secureTextEntry
                    autoComplete="password"
                />

                {error && (
                    <Text style={styles.errorText}>
                        {error instanceof Error ? error.message : 'Login failed'}
                    </Text>
                )}

                <Button
                    title="Sign In"
                    onPress={handleSubmit}
                    loading={isLoading}
                    fullWidth
                    style={styles.button}
                />

                <Button
                    title="Create Account"
                    variant="ghost"
                    onPress={onRegisterPress}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.icon,
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    button: {
        marginTop: 8,
    },
    errorText: {
        color: Colors.light.error,
        fontSize: 14,
        textAlign: 'center',
    },
});
