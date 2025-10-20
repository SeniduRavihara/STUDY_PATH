import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AboutScreen() {
  const handleCheckUpdates = () => {
    Alert.alert(
      "Check Updates",
      "You're using the latest version of StudyPath!",
    );
  };

  const handleOpenWebsite = () => {
    Linking.openURL("https://studypath.app");
  };

  const handleOpenGitHub = () => {
    Linking.openURL("https://github.com/studypath/app");
  };

  const handleOpenTwitter = () => {
    Linking.openURL("https://twitter.com/studypath");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <View style={styles.appInfoCenter}>
          <View style={styles.appIcon}>
            <Ionicons name="book" size={48} color="white" />
          </View>
          <Text style={styles.appName}>StudyPath</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.buildText}>Build 2024.01.15</Text>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            StudyPath is a modern learning platform that helps students track
            their progress, import educational content, and achieve their
            academic goals through interactive quizzes and personalized study
            plans.
          </Text>
        </View>
      </View>

      {/* App Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          App Information
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.15</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database</Text>
            <Text style={styles.infoValue}>SQLite + Supabase</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleCheckUpdates}
        >
          <View style={styles.actionContent}>
            <Ionicons name="refresh-outline" size={24} color="#3b82f6" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                Check for Updates
              </Text>
              <Text style={styles.actionSubtitle}>
                See if a new version is available
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Social Links */}
      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>
          Connect With Us
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleOpenWebsite}
        >
          <View style={styles.actionContent}>
            <Ionicons name="globe-outline" size={24} color="#3b82f6" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Website</Text>
              <Text style={styles.actionSubtitle}>studypath.app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleOpenGitHub}
        >
          <View style={styles.actionContent}>
            <Ionicons name="logo-github" size={24} color="#6b7280" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>GitHub</Text>
              <Text style={styles.actionSubtitle}>View source code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleOpenTwitter}
        >
          <View style={styles.actionContent}>
            <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Twitter</Text>
              <Text style={styles.actionSubtitle}>
                Follow us for updates
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Credits */}
      <View style={styles.creditsSection}>
        <Text style={styles.sectionTitle}>Credits</Text>

        <View style={styles.creditsCard}>
          <Text style={styles.creditTitle}>Developed by</Text>
          <Text style={styles.creditText}>StudyPath Team</Text>

          <Text style={styles.creditTitle}>
            Technologies Used
          </Text>
          <Text style={styles.creditText}>• React Native & Expo</Text>
          <Text style={styles.creditText}>• TypeScript</Text>
          <Text style={styles.creditText}>• Supabase</Text>
          <Text style={styles.creditText}>• SQLite & Drizzle ORM</Text>
          <Text style={styles.creditText}>
            • NativeWind (Tailwind CSS)
          </Text>

          <Text style={styles.creditTitleWithMargin}>Icons</Text>
          <Text style={styles.creditText}>Ionicons by Ionic Framework</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 24,
  },
  appInfoSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  appInfoCenter: {
    alignItems: "center",
    marginBottom: 32,
  },
  appIcon: {
    backgroundColor: "#3b82f6",
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  versionText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  buildText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },
  descriptionCard: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  descriptionText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: "#9ca3af",
  },
  infoValue: {
    color: "white",
    fontWeight: "600",
  },
  actionCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    color: "white",
    fontWeight: "600",
  },
  actionSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  creditsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  creditsCard: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 16,
  },
  creditTitle: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
  },
  creditTitleWithMargin: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  creditText: {
    color: "#9ca3af",
    marginBottom: 8,
  },
});