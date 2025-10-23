import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

type UserStats = {
  name: string;
  email: string;
  level: string;
  points: number;
  streak: number;
  completedLessons: number;
  totalHours: number;
  rank: string;
};

type Achievement = {
  name: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();

  // If no user, redirect to login immediately
  if (!loading && !user) {
    console.log("Profile Screen - NO USER, redirecting to login!"); // Debug log
    return <Redirect href="/auth/login" />;
  }

  // If still loading, show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const userStats: UserStats = {
    name: user?.user_metadata?.name || "Student",
    email: user?.email || "student@email.com",
    level: "Advanced Learner",
    points: 2847,
    streak: 12,
    completedLessons: 47,
    totalHours: 156,
    rank: "Top 5%",
  };

  const recentAchievements: Achievement[] = [
    { name: "Mathematics Master", date: "2 days ago", icon: "calculator" },
    { name: "Study Streak Champion", date: "1 week ago", icon: "flame" },
    { name: "Perfect Score", date: "2 weeks ago", icon: "trophy" },
  ];

  const menuItems: MenuItem[] = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your information",
    },
    {
      icon: "settings-outline",
      title: "Settings",
      subtitle: "Preferences and notifications",
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help and contact us",
    },
    {
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and info",
    },
  ];

  const handleLogout = async () => {
    console.log("Logout button pressed"); // Debug log

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Attempting to sign out..."); // Debug log
            const { error } = await signOut();
            if (error) {
              console.error("Sign out error:", error); // Debug log
              Alert.alert("Error", `Failed to logout: ${error.message}`);
            } else {
              console.log("Sign out successful"); // Debug log
            }
          } catch (error) {
            console.error("Sign out exception:", error); // Debug log
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleMenuItemPress = (title: string) => {
    switch (title) {
      case "Edit Profile":
        router.push("/profile/edit-profile");
        break;
      case "Settings":
        router.push("/profile/settings");
        break;
      case "Help & Support":
        router.push("/profile/help-support");
        break;
      case "About":
        router.push("/profile/about");
        break;
      default:
        Alert.alert("Coming Soon", "This feature is coming soon!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient colors={["#0f0f23", "#1a1a2e"]} style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userStats.name}</Text>
          <Text style={styles.userEmail}>{userStats.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{userStats.level}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>
              {userStats.points.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{userStats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#10b981" />
            <Text style={styles.statValue}>{userStats.completedLessons}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{userStats.totalHours}h</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {recentAchievements.map((achievement, index) => (
          <View key={index} style={styles.achievementCard}>
            <View style={styles.achievementContent}>
              <View style={styles.achievementIconContainer}>
                <Ionicons name={achievement.icon} size={20} color="black" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDate}>{achievement.date}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.title)}
          >
            <View style={styles.menuItemContent}>
              <Ionicons
                name={item.icon}
                size={24}
                color="#6b7280"
                style={styles.menuIcon}
              />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert("Premium", "Premium features coming soon!")}
      >
        <LinearGradient
          colors={["#a855f7", "#ec4899"]}
          style={styles.fabGradient}
        >
          <Ionicons name="sparkles" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  profileContainer: {
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: "#3b82f6",
    padding: 8,
    borderRadius: 9999,
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  userEmail: {
    color: "#9ca3af",
    fontSize: 16,
  },
  levelBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginTop: 12,
  },
  levelText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  achievementsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  achievementContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIconContainer: {
    backgroundColor: "#eab308",
    padding: 12,
    borderRadius: 9999,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: "#ffffff",
    fontWeight: "600",
  },
  achievementDate: {
    color: "#9ca3af",
    fontSize: 14,
  },
  menuSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  menuItem: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: "#ffffff",
    fontWeight: "600",
  },
  menuSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  logoutSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 16,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 96,
    right: 24,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabGradient: {
    padding: 16,
    borderRadius: 9999,
  },
});
