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
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRegister } from "../hooks/useRegister";
import { authService } from "../services/authService";
import { parseAuthError } from "../utils/authErrors";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPw?: string;
    general?: string;
  }>({});

  const { registerAsync, isLoading } = useRegister();

  const canSubmit = useMemo(() => {
    if (!agree) return false;
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) return false;
    if (confirmPw !== password) return false;
    return true;
  }, [agree, fullName, username, email, password, confirmPw]);

  const onSubmit = async () => {
    const nextErrors: {
      fullName?: string;
      username?: string;
      email?: string;
      password?: string;
      confirmPw?: string;
      general?: string;
    } = {};

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      nextErrors.fullName = "Full name is required";
    }

    if (!trimmedUsername) {
      nextErrors.username = "Username is required";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required";
    } else if (!authService.validateEmail(trimmedEmail)) {
      nextErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required";
    }

    if (!confirmPw.trim()) {
      nextErrors.confirmPw = "Confirm password is required";
    } else if (confirmPw !== password) {
      nextErrors.confirmPw = "Passwords do not match";
    }

    if (!agree) {
      nextErrors.general = "Please accept the terms to continue";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const [firstname, ...rest] = trimmedName.split(/\s+/);
    const lastname = rest.join(" ");

    setErrors({});
    setStatusMessage(null);
    try {
      const response = await registerAsync({
        firstname,
        lastname,
        email: trimmedEmail,
        username: trimmedUsername,
        password,
      });
      setStatusMessage(response.message);
      router.push({ pathname: "/(auth)/verify-otp-register", params: { email: trimmedEmail } });
    } catch (error) {
      const parsed = parseAuthError(error);
      setErrors({
        fullName: parsed.fieldErrors?.firstname || parsed.fieldErrors?.lastname,
        username: parsed.fieldErrors?.username,
        email: parsed.fieldErrors?.email,
        password: parsed.fieldErrors?.password,
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

          <Text style={styles.title}>Mật khẩu</Text>

          {/* Full name */}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#2F80ED" />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              placeholderTextColor="#7B8AA0"
              style={styles.input}
            />
          </View>
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

          {/* Username */}
          <View style={styles.inputWrap}>
            <Ionicons name="at-outline" size={18} color="#2F80ED" />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#7B8AA0"
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

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

          {/* Password */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#2F80ED" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu"
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
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirm */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#2F80ED" />
            <TextInput
              value={confirmPw}
              onChangeText={setConfirmPw}
              placeholder="Xác nhân mật khẩu"
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
          {errors.confirmPw ? <Text style={styles.errorText}>{errors.confirmPw}</Text> : null}

          {/* Agree */}
          <Pressable style={styles.agreeRow} onPress={() => setAgree((a) => !a)}>
            <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
              {agree && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.agreeText}>
              I agree to the <Text style={styles.linkText}>Terms of Use</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </Pressable>

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
            <Text style={styles.btnText}>Đăng ký</Text>
          </Pressable>
          {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn}>
              <FontAwesome name="google" size={18} color="#DB4437" />
            </Pressable>
            <Pressable style={styles.socialBtn}>
              <FontAwesome name="facebook" size={18} color="#1877F2" />
            </Pressable>
          </View>

          {/* Bottom */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}> Bạn đã có tài khoản ? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={[styles.linkText, { fontWeight: "700" }]}>Đăng nhập ngay </Text>
              </Pressable>
            </Link>
          </View>
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
  logo: { width: 110, height: 110, alignSelf: "center", marginBottom: 8 },
  title: {
    fontSize: 38,
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
  agreeRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 2, marginBottom: 14 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  agreeText: { flex: 1, color: "#64748B", fontSize: 12.5, lineHeight: 18 },
  linkText: { color: "#2F80ED" },
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
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 14, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E7EEF7" },
  dividerText: { color: "#7B8AA0", fontSize: 12.5 },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 14, marginBottom: 16 },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EEF7",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomRow: { flexDirection: "row", justifyContent: "center" },
  bottomText: { color: "#64748B", fontSize: 13.5 },
});
