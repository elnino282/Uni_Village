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
import { useLogin } from "../hooks/useLogin";
import { authService } from "../services/authService";
import { parseAuthError } from "../utils/authErrors";


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { loginAsync, isLoading } = useLogin();

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password]
  );

  const onSubmit = async () => {
    const nextErrors: { email?: string; password?: string; general?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email is required";
    } else if (!authService.validateEmail(trimmedEmail)) {
      nextErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      await loginAsync({ email: trimmedEmail, password });
      router.replace("/(tabs)");
    } catch (error) {
      const parsed = parseAuthError(error);
      setErrors({
        email: parsed.fieldErrors?.email,
        password: parsed.fieldErrors?.password,
        general: parsed.message,
      });
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F1FAF5"]} style={styles.bg}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Mật khẩu</Text>

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

          <View style={styles.rowRight}>
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={styles.linkText}>Quên Mật Khẩu</Text>
            </Pressable>
          </View>

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
            <Text style={styles.btnText}>Đăng Nhập</Text>
          </Pressable>
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc đăng nhập bằng</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
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
            <Text style={styles.bottomText}>Chưa có tài khoản ? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={[styles.linkText, { fontWeight: "700" }]}>
                  Đăng ký ngay
                </Text>
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
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
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
  logo: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 8,
  },
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
  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 14.5,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12.5,
    marginBottom: 8,
    marginLeft: 12,
  },
  rowRight: { alignItems: "flex-end", marginBottom: 14 },
  linkText: { color: "#2F80ED", fontSize: 13.5 },
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E7EEF7" },
  dividerText: { color: "#7B8AA0", fontSize: 12.5 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 16,
  },
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
