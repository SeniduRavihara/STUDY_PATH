import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Subject,
  SubscriptionService,
} from "../../../superbase/services/subscriptionService";

// Define types for better type safety
type LocalSubject = {
  id: number;
  name: string;
  chapters: number;
  completed: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: [string, string];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  xp: number;
  streak: number;
};

export default function StudyScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams();
  const parsedSubject = subject ? JSON.parse(subject as string) : null;
  const { user } = useAuth();

  const [subscribedSubjects, setSubscribedSubjects] = useState<Subject[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigatingToFlow, setNavigatingToFlow] = useState<string | null>(null);

  // Load user's subscribed subjects
  const loadSubscribedSubjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const subjects = await SubscriptionService.getUserSubscriptions(user.id);
      setSubscribedSubjects(subjects);
    } catch (error) {
      console.error("Error loading subscribed subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscribedSubjects();
    setRefreshing(false);
  };

  // Load subjects on component mount
  useEffect(() => {
    loadSubscribedSubjects();
  }, [user?.id]);

  // Handle subscribing to new subjects
  const handleSubscribeToSubjects = () => {
    router.push("/study/subscribe");
  };

  // Handle navigation to flow with loading state
  const handleNavigateToFlow = async (subject: Subject) => {
    setNavigatingToFlow(subject.id);
    // Small delay to show loading state
    setTimeout(() => {
      router.push({
        pathname: "/study/flow",
        params: { subject: JSON.stringify(subject) },
      });
      setNavigatingToFlow(null);
    }, 300);
  };

  // If we have a subject from navigation, redirect directly to flow screen
  React.useEffect(() => {
    if (parsedSubject) {
      router.replace({
        pathname: "/study/flow",
        params: { subject: JSON.stringify(parsedSubject) },
      });
    }
  }, [parsedSubject, router]);

  return (
    <ScrollView
      className="flex-1 bg-slate-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        className="px-6 pt-14 pb-8"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Study Hub</Text>
            <Text className="text-gray-400 text-base">
              Your subscribed subjects
            </Text>
          </View>
          <TouchableOpacity className="bg-slate-800 p-3 rounded-full">
            <Ionicons name="search" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Subjects */}
      <View className="px-6 mt-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Your Subjects</Text>
          <TouchableOpacity
            onPress={handleSubscribeToSubjects}
            className="bg-blue-600 px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm font-medium">
              + Add Subject
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center py-8">
            <Text className="text-gray-400">Loading your subjects...</Text>
          </View>
        ) : subscribedSubjects.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="book-outline" size={64} color="#6b7280" />
            <Text className="text-white text-lg font-semibold mt-4">
              No Subjects Yet
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Subscribe to subjects to start learning
            </Text>
            <TouchableOpacity
              onPress={handleSubscribeToSubjects}
              className="bg-blue-600 px-6 py-3 rounded-full mt-4"
            >
              <Text className="text-white font-medium">Browse Subjects</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subscribedSubjects.map(subject => (
            <TouchableOpacity
              key={subject.id}
              className="mb-4"
              onPress={() => handleNavigateToFlow(subject)}
              disabled={navigatingToFlow === subject.id}
            >
              <LinearGradient
                colors={["#1a1a2e", "#16213e"]}
                className="p-6 rounded-3xl"
              >
                {navigatingToFlow === subject.id && (
                  <View className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                    <View className="bg-slate-800 p-4 rounded-2xl flex-row items-center">
                      <ActivityIndicator size="small" color="#00d4ff" />
                      <Text className="text-white ml-3 font-medium">Loading...</Text>
                    </View>
                  </View>
                )}
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={subject.color || ['#3B82F6', '#3B82F6']}
                    className="p-4 rounded-2xl mr-4"
                  >
                    <Ionicons
                      name={subject.icon as any}
                      size={28}
                      color="white"
                    />
                  </LinearGradient>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-white text-lg font-bold">
                        {subject.name}
                      </Text>
                      <View className="bg-slate-700 px-3 py-1 rounded-full">
                        <Text className="text-gray-300 text-xs">
                          {subject.difficulty}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-400 text-sm">
                        {subject.completed}/{subject.chapters} chapters
                        completed
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text className="text-yellow-400 text-sm ml-1">
                          {subject.xp} XP
                        </Text>
                      </View>
                    </View>

                    <View className="bg-slate-700 rounded-full h-2">
                      <LinearGradient
                        colors={subject.color || ['#3B82F6', '#3B82F6']}
                        className="rounded-full h-2"
                        style={{
                          width: `${(subject.completed / subject.chapters) * 100}%`,
                        }}
                      />
                    </View>

                    {subject.streak > 0 && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="flame" size={16} color="#FF6B6B" />
                        <Text className="text-red-400 text-xs ml-1">
                          {subject.streak} day streak
                        </Text>
                      </View>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={24} color="#6b7280" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
