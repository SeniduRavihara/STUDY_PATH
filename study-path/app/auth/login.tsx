import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

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
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8 pb-24">
          <Text className="text-cyan-400 text-5xl font-extrabold text-center mb-2">
            {`StudyPath`}
          </Text>
          <Text className="text-gray-400 text-base text-center mb-12">
            {`Welcome Back!`}
          </Text>

          <View className="mb-8">
            <TextInput
              className="bg-white/10 rounded-xl px-4 py-4 text-base text-white mb-4 border border-white/20"
              placeholder="Email"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              className="bg-white/10 rounded-xl px-4 py-4 text-base text-white mb-4 border border-white/20"
              placeholder="Password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              className="rounded-xl py-4 items-center mb-3 bg-cyan-400 active:bg-cyan-300"
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className="text-[#0f0f23] text-base font-bold">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-xl py-4 items-center border-2 border-cyan-400"
              onPress={goToSignUp}
            >
              <Text className="text-cyan-400 text-base font-bold">
                {`Don\u2019t have an account? Sign Up`}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-gray-500 text-xs">
            {`Sign in to continue your learning journey`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
