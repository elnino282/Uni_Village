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
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useVerifyOtpRegister } from "../hooks/useVerifyOtpRegister";
import { authService } from "../services/authService";
import { parseAuthError } from "../utils/authErrors";

export default function VerifyOtpRegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{ email?: string; otp?: string; general?: string }>({});

  const { verifyOtpRegisterAsync, isLoading } = useVerifyOtpRegister();

  const canSubmit = useMemo(
    () => email.trim().length > 0 && otp.trim().length > 0,
    [email, otp]
  );

  const onSubmit = async () => {
    const nextErrors: { email?: string; otp?: string; general?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email is required";
    } else if (!authService.validateEmail(trimmedEmail)) {
      nextErrors.email = "Invalid email format";
    }

    if (!otp.trim()) {
      nextErrors.otp = "OTP is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      await verifyOtpRegisterAsync({ email: trimmedEmail, otp: otp.trim() });
      router.replace("/(tabs)");
    } catch (error) {
      const parsed = parseAuthError(error);
      setErrors({
        email: parsed.fieldErrors?.email,
        otp: parsed.fieldErrors?.otp,
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

          <Text style={styles.title}>Verify OTP</Text>

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

          {/* OTP */}
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={18} color="#2F80ED" />
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="OTP"
              placeholderTextColor="#7B8AA0"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="number-pad"
            />
          </View>
          {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}

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
            <Text style={styles.btnText}>Verify</Text>
          </Pressable>
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
