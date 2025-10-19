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
import { UserService } from "@/superbase/services/userService";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    color: '#06b6d4',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  menuItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

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
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>
            {userStats.name}
          </Text>
          <Text style={styles.email}>{userStats.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{userStats.level}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>
              {userStats.points.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#ef4444" />
            <Text style={styles.statNumber}>
              {userStats.streak}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#10b981" />
            <Text style={styles.statNumber}>
              {userStats.completedLessons}
            </Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>
              {userStats.totalHours}h
            </Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Achievements
        </Text>
        {recentAchievements.map((achievement, index) => (
          <View key={index} style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name={achievement.icon} size={20} color="white" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementName}>
                {achievement.name}
              </Text>
              <Text style={styles.achievementDate}>
                {achievement.date}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.title)}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons
                name={item.icon}
                size={24}
                color="#6b7280"
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutButtonText}>
            Logout
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
