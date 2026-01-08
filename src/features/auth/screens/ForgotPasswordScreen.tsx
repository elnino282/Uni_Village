import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { authService } from "../services/authService";
import { parseAuthError } from "../utils/authErrors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { requestResetAsync, isLoading } = useForgotPassword();

  const canSubmit = useMemo(() => {
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) return false;
    if (confirmPassword !== newPassword) return false;
    return true;
  }, [email, newPassword, confirmPassword]);

  const onSubmit = async () => {
    const nextErrors: {
      email?: string;
      newPassword?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email is required";
    } else if (!authService.validateEmail(trimmedEmail)) {
      nextErrors.email = "Invalid email format";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatusMessage(null);
    try {
      const response = await requestResetAsync({
        email: trimmedEmail,
        newPassword,
        confirmPassword,
      });
      setStatusMessage(response.message);
      router.push({ pathname: "/(auth)/verify-otp-forgot-password", params: { email: trimmedEmail } });
    } catch (error) {
      const parsed = parseAuthError(error);
      setErrors({
        email: parsed.fieldErrors?.email,
        newPassword: parsed.fieldErrors?.newPassword,
        confirmPassword: parsed.fieldErrors?.confirmPassword,
        general: parsed.message,
      });
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F1FAF5"]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Reset Password</Text>

          {/* Email */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#2F80ED" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#7B8AA0"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* New password */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#2F80ED" />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              placeholderTextColor="#7B8AA0"
              style={styles.input}
              secureTextEntry={!showPw}
            />
            <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={10}>
              <Ionicons
                name={showPw ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#7B8AA0"
              />
            </Pressable>
          </View>
          {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}

          {/* Confirm */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#2F80ED" />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#7B8AA0"
              style={styles.input}
              secureTextEntry={!showConfirm}
            />
            <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={10}>
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#7B8AA0"
              />
            </Pressable>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          {/* Button */}
          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit || isLoading}
            style={({ pressed }) => [
              styles.btn,
              (!canSubmit || isLoading) && styles.btnDisabled,
              pressed && canSubmit && { opacity: 0.92 },
            ]}
          >
            <Text style={styles.btnText}>Send OTP</Text>
          </Pressable>
          {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  logo: { width: 90, height: 90, alignSelf: "center", marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A5F",
    textAlign: "center",
    marginBottom: 18,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.4,
    borderColor: "#5AA6FF",
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  input: { flex: 1, color: "#0F172A", fontSize: 14.5 },
  errorText: {
    color: "#DC2626",
    fontSize: 12.5,
    marginBottom: 8,
    marginLeft: 12,
  },
  statusText: {
    color: "#166534",
    fontSize: 12.5,
    marginTop: 8,
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#16A34A",
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14.5 },
});
