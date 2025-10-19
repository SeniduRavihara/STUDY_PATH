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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
            {`Create Your Account`}
          </Text>

          <View className="mb-8">
            <TextInput
              className="bg-white/10 rounded-xl px-4 py-4 text-base text-white mb-4 border border-white/20"
              placeholder="Full Name"
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />

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
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text className="text-[#0f0f23] text-base font-bold">
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-xl py-4 items-center border-2 border-cyan-400"
              onPress={goToLogin}
            >
              <Text className="text-cyan-400 text-base font-bold">
                {`Already have an account? Sign In`}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-gray-500 text-xs">
            {`Join StudyPath and start your learning journey`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
