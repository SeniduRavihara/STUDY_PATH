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
  View
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
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 96,
  },
  title: {
    color: '#06b6d4',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      console.log("Sign in validation failed: Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        router.replace("/(tabs)");
      } else {
        console.log("Sign in error:", error.message);
      }
    } catch (err) {
      console.log("Unexpected sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => {
    router.push("/auth/signup");
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
  <Text style={styles.title}>
  {`StudyPath`}
  </Text>
  <Text style={styles.subtitle}>
  {`Welcome Back!`}
  </Text>

  <View style={styles.form}>
  <TextInput
  style={styles.input}
  placeholder="Email"
  placeholderTextColor="#6b7280"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
  />

  <TextInput
  style={styles.input}
  placeholder="Password"
  placeholderTextColor="#6b7280"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  autoCapitalize="none"
  />

  <TouchableOpacity
  style={[styles.primaryButton, loading && styles.buttonDisabled]}
  onPress={handleSignIn}
  disabled={loading}
  >
  <Text style={styles.primaryButtonText}>
  {loading ? "Signing In..." : "Sign In"}
  </Text>
  </TouchableOpacity>

  <TouchableOpacity
  style={styles.secondaryButton}
  onPress={goToSignUp}
  >
  <Text style={styles.secondaryButtonText}>
  {`Don\u2019t have an account? Sign Up`}
  </Text>
  </TouchableOpacity>
  </View>

  <Text style={styles.footer}>
  {`Sign in to continue your learning journey`}
  </Text>
  </View>
  </KeyboardAvoidingView>
  </LinearGradient>
  );
}
