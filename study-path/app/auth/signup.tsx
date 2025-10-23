import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 96,
  },
  title: {
    color: "#06b6d4",
    fontSize: 48,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 50,
    paddingVertical: 16,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(100, 255, 218, 0.3)",
  },
  inputFocused: {
    borderColor: "rgba(100, 255, 218, 0.6)",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 18,
  },
  passwordInputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 50,
    paddingRight: 50,
    paddingVertical: 16,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(100, 255, 218, 0.3)",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  primaryButton: {
    backgroundColor: "#06b6d4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#0f0f23",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#06b6d4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#06b6d4",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 12,
  },
});

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      console.log("Sign up validation failed: Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      console.log(
        "Sign up validation failed: Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (!error) {
        router.push("/auth/login");
      } else {
        console.log("Sign up error:", error.message);
      }
    } catch (err) {
      console.log("Unexpected sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <LinearGradient
      colors={["#0f0f23", "#1a1a2e", "#16213e"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{`StudyPath`}</Text>
          <Text style={styles.subtitle}>{`Create Your Account`}</Text>

          <View style={styles.form}>
            {/* Name Input with Icon */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  nameFocused && styles.inputFocused,
                ]}
                placeholder="Full Name"
                placeholderTextColor="#4a5568"
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <View style={styles.inputIcon}>
                <Ionicons
                  name="person"
                  size={20}
                  color={nameFocused ? "#64ffda" : "#4a5568"}
                />
              </View>
            </View>

            {/* Email Input with Icon */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                ]}
                placeholder="Email"
                placeholderTextColor="#4a5568"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.inputIcon}>
                <Ionicons
                  name="mail"
                  size={20}
                  color={emailFocused ? "#64ffda" : "#4a5568"}
                />
              </View>
            </View>

            {/* Password Input with Icons */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  passwordFocused && styles.inputFocused,
                ]}
                placeholder="Password"
                placeholderTextColor="#4a5568"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={passwordFocused ? "#64ffda" : "#4a5568"}
                />
              </View>
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#64ffda"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goToLogin}
            >
              <Text style={styles.secondaryButtonText}>
                {`Already have an account? Sign In`}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            {`Join StudyPath and start your learning journey`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}