import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [dataSync, setDataSync] = useState(true);

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Are you sure you want to clear the cache?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          Alert.alert("Success", "Cache cleared successfully!");
        },
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Your data will be exported to your device.");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your account has been deleted.");
          },
        },
      ],
    );
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#6b7280"
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>
                  Push Notifications
                </Text>
                <Text style={styles.settingSubtitle}>
                  Receive study reminders
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#374151", true: "#3b82f6" }}
              thumbColor={notifications ? "#ffffff" : "#9ca3af"}
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={24} color="#6b7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Sound Effects</Text>
                <Text style={styles.settingSubtitle}>
                  Play sounds for actions
                </Text>
              </View>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: "#374151", true: "#3b82f6" }}
              thumbColor={soundEffects ? "#ffffff" : "#9ca3af"}
            />
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color="#6b7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#374151", true: "#3b82f6" }}
              thumbColor={darkMode ? "#ffffff" : "#9ca3af"}
            />
          </View>
        </View>
      </View>

      {/* Data & Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Data & Storage
        </Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="save-outline" size={24} color="#6b7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Auto Save</Text>
                <Text style={styles.settingSubtitle}>
                  Automatically save progress
                </Text>
              </View>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: "#374151", true: "#3b82f6" }}
              thumbColor={autoSave ? "#ffffff" : "#9ca3af"}
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-outline" size={24} color="#6b7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Cloud Sync</Text>
                <Text style={styles.settingSubtitle}>
                  Sync data across devices
                </Text>
              </View>
            </View>
            <Switch
              value={dataSync}
              onValueChange={setDataSync}
              trackColor={{ false: "#374151", true: "#3b82f6" }}
              thumbColor={dataSync ? "#ffffff" : "#9ca3af"}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={handleClearCache}
        >
          <View style={styles.actionRow}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Clear Cache</Text>
              <Text style={styles.settingSubtitle}>
                Free up storage space
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={handleExportData}
        >
          <View style={styles.actionRow}>
            <Ionicons name="download-outline" size={24} color="#10b981" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Export Data</Text>
              <Text style={styles.settingSubtitle}>Download your data</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <View style={styles.actionRow}>
            <Ionicons name="warning-outline" size={24} color="white" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.deleteAccountTitle}>Delete Account</Text>
              <Text style={styles.deleteAccountSubtitle}>
                Permanently delete your account
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    color: "white",
    fontWeight: "600",
  },
  settingSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  deleteAccountButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 16,
  },
  deleteAccountTitle: {
    color: "white",
    fontWeight: "600",
  },
  deleteAccountSubtitle: {
    color: "#fecaca",
    fontSize: 14,
  },
});