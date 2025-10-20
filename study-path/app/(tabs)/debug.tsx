import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  checkAuthStorage,
  clearAuthStorage,
  getSessionInfo,
  refreshSession,
} from "../../utils/authUtils";

export default function DebugScreen() {
  const router = useRouter();
  const { user, session, loading } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Debug Tools</Text>
        <Text style={styles.headerSubtitle}>
          Developer utilities and database tools
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Authentication Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔐 Authentication Tools
          </Text>

          {/* Current Auth Status */}
          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>
              Current Status:
            </Text>
            <Text style={styles.statusText}>
              User: {user?.email || "Not logged in"}
            </Text>
            <Text style={styles.statusText}>
              Loading: {loading ? "Yes" : "No"}
            </Text>
            <Text style={styles.statusText}>
              Session: {session ? "Active" : "None"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonBlue]}
            onPress={async () => {
              try {
                const info = await getSessionInfo();
                console.log("🔍 Session Info:", info);
                Alert.alert("Session Info", JSON.stringify(info, null, 2), [
                  { text: "OK" },
                ]);
              } catch (error) {
                console.error("❌ Session info failed:", error);
                Alert.alert("Error", "Failed to get session info");
              }
            }}
          >
            <Text style={styles.buttonText}>
              🔍 Check Session Info
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextBlue]}>
              Get detailed session information
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonGreen]}
            onPress={async () => {
              try {
                const result = await checkAuthStorage();
                console.log("📱 Storage Check:", result);
                Alert.alert(
                  "Storage Check",
                  `Platform: ${result.platform}\nHas Auth: ${result.hasAuth}`,
                  [{ text: "OK" }],
                );
              } catch (error) {
                console.error("❌ Storage check failed:", error);
                Alert.alert("Error", "Failed to check storage");
              }
            }}
          >
            <Text style={styles.buttonText}>
              📱 Check Storage
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextGreen]}>
              Check if auth data is stored
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonYellow]}
            onPress={async () => {
              try {
                const result = await refreshSession();
                if (result.error) {
                  Alert.alert("Error", "Failed to refresh session");
                } else {
                  Alert.alert("Success", "Session refreshed successfully");
                }
              } catch (error) {
                console.error("❌ Session refresh failed:", error);
                Alert.alert("Error", "Failed to refresh session");
              }
            }}
          >
            <Text style={styles.buttonText}>
              🔄 Refresh Session
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextYellow]}>
              Force refresh authentication session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonRed]}
            onPress={async () => {
              Alert.alert(
                "Clear Auth Storage",
                "This will clear all authentication data and sign you out. Are you sure?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const result = await clearAuthStorage();
                        if (result.success) {
                          Alert.alert(
                            "Success",
                            "Auth storage cleared successfully",
                          );
                        } else {
                          Alert.alert("Error", "Failed to clear auth storage");
                        }
                      } catch (error) {
                        console.error("❌ Clear storage failed:", error);
                        Alert.alert("Error", "Failed to clear auth storage");
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Text style={styles.buttonText}>
              🗑️ Clear Auth Storage
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextRed]}>
              Clear all stored authentication data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Database Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🚀 Drizzle ORM Tools
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPurple]}
            onPress={async () => {
              try {
                const drizzleQuizService = await import(
                  "../../lib/drizzleQuizService"
                );
                await drizzleQuizService.default.createSampleQuizzes();
                console.log("✅ Drizzle sample quizzes created!");
              } catch (error) {
                console.error("❌ Drizzle test failed:", error);
              }
            }}
          >
            <Text style={styles.buttonText}>
              🧪 Test Drizzle ORM
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextPurple]}>
              Create sample data with Drizzle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonGreen]}
            onPress={async () => {
              try {
                const drizzleQuizService = await import(
                  "../../lib/drizzleQuizService"
                );
                const stats =
                  await drizzleQuizService.default.getDatabaseStats();
                console.log("📊 Drizzle Database Stats:", stats);
              } catch (error) {
                console.error("❌ Error getting database stats:", error);
              }
            }}
          >
            <Text style={styles.buttonText}>
              📈 Log Database Stats
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextGreen]}>
              Print table counts to console
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonOrange]}
            onPress={async () => {
              try {
                const drizzleQuizService = await import(
                  "../../lib/drizzleQuizService"
                );
                const result =
                  await drizzleQuizService.default.createSampleQuizzes();
                console.log("✅ Drizzle Database re-seeded:", result.message);
              } catch (error) {
                console.error("❌ Error seeding database:", error);
              }
            }}
          >
            <Text style={styles.buttonText}>
              🌱 Re-seed Database
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextOrange]}>
              Clear and add sample data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonRed, styles.buttonLast]}
            onPress={async () => {
              try {
                // Clear SQLite database
                const drizzleQuizService = await import(
                  "../../lib/drizzleQuizService"
                );
                await drizzleQuizService.default.clearAllData();
                console.log("🗑️ SQLite Database cleared successfully");

                // Reset import flags in Supabase
                const { FeedService } = await import("../../lib/feedService");
                const result = await FeedService.resetAllImportFlags();
                if (result.success) {
                  console.log("✅ Import flags reset successfully");
                  Alert.alert(
                    "Success",
                    "Database cleared and import flags reset!",
                  );
                } else {
                  console.log(
                    "⚠️ Database cleared but import flags reset failed",
                  );
                  Alert.alert(
                    "Partial Success",
                    "Database cleared but import flags reset failed",
                  );
                }
              } catch (error) {
                console.error("❌ Error clearing database:", error);
                Alert.alert("Error", "Failed to clear database");
              }
            }}
          >
            <Text style={styles.buttonText}>
              🗑️ Clear Database
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextRed]}>
              Clear SQLite + Reset Import Flags
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full Reset */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚠️ Full Reset
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonRedDark, styles.buttonLast]}
            onPress={async () => {
              Alert.alert(
                "Full Reset",
                "This will clear ALL data and reset import flags. Are you sure?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Reset Everything",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        // Clear SQLite database
                        const drizzleQuizService = await import(
                          "../../lib/drizzleQuizService"
                        );
                        await drizzleQuizService.default.clearAllData();
                        console.log("🗑️ SQLite Database cleared");

                        // Reset import flags in Supabase
                        const { FeedService } = await import(
                          "../../lib/feedService"
                        );
                        const result = await FeedService.resetAllImportFlags();

                        if (result.success) {
                          console.log("✅ Full reset completed successfully");
                          Alert.alert(
                            "Success",
                            "Full reset completed! All data cleared and import flags reset.",
                          );
                        } else {
                          console.log(
                            "⚠️ Partial reset - database cleared but import flags failed",
                          );
                          Alert.alert(
                            "Partial Success",
                            "Database cleared but import flags reset failed",
                          );
                        }
                      } catch (error) {
                        console.error("❌ Error during full reset:", error);
                        Alert.alert("Error", "Failed to complete full reset");
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Text style={styles.buttonText}>
              🔥 Full Reset Everything
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextRed]}>
              Clear ALL data + Reset ALL flags (with confirmation)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎯 Quiz Tools
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPurple]}
            onPress={async () => {
              try {
                const drizzleQuizService = await import(
                  "../../lib/drizzleQuizService"
                );
                const mathQuizzes =
                  await drizzleQuizService.default.getQuizzesBySubject(
                    "Mathematics",
                  );
                console.log("📚 Mathematics Quizzes:", mathQuizzes);
              } catch (error) {
                console.error("❌ Error loading quizzes:", error);
              }
            }}
          >
            <Text style={styles.buttonText}>
              📚 Log Math Quizzes
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextPurple]}>
              Show all Mathematics quizzes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonIndigo, styles.buttonLast]}
            onPress={async () => {
              try {
                const drizzleQuizService = await import(
                  "../../lib/drizzleQuizService"
                );
                await drizzleQuizService.default.initialize();
                console.log("🔧 Drizzle Quiz service initialized");
              } catch (error) {
                console.error("❌ Error initializing quiz service:", error);
              }
            }}
          >
            <Text style={styles.buttonText}>
              🔧 Initialize Quiz Service
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextIndigo]}>
              Force initialize database
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feed Import Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📥 Feed Import Management
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonRed, styles.buttonLast]}
            onPress={async () => {
              try {
                const { FeedService } = await import("../../lib/feedService");
                const result = await FeedService.resetAllImportFlags();
                if (result.success) {
                  console.log("✅ All import flags reset successfully!");
                  Alert.alert("Success", "All import flags have been reset!");
                } else {
                  console.error(
                    "❌ Failed to reset import flags:",
                    result.error,
                  );
                  Alert.alert("Error", "Failed to reset import flags");
                }
              } catch (error) {
                console.error("❌ Error resetting import flags:", error);
                Alert.alert("Error", "Failed to reset import flags");
              }
            }}
          >
            <Text style={styles.buttonText}>
              🔄 Reset Import Flags
            </Text>
            <Text style={[styles.buttonSubtext, styles.buttonSubtextRed]}>
              Reset all quiz pack import flags in Supabase
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Info</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Version:</Text> 1.0.0
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Database:</Text> SQLite + Drizzle
              ORM
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Platform:</Text> Expo SDK 51
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Database Location:</Text> App
              Internal Storage
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Database File:</Text> studypath.db
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>ORM:</Text> Drizzle (Type-safe)
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📖 Instructions
          </Text>

          <Text style={styles.instructionText}>
            • <Text style={styles.instructionBold}>Test Drizzle ORM:</Text> Creates
            sample data using Drizzle{"\n"}•{" "}
            <Text style={styles.instructionBold}>Log Stats:</Text> Prints table
            counts to the console{"\n"}•{" "}
            <Text style={styles.instructionBold}>Re-seed:</Text> Clears and adds
            sample quiz data{"\n"}•{" "}
            <Text style={styles.instructionBold}>Clear:</Text> Removes all data from
            database{"\n"}•{" "}
            <Text style={styles.instructionBold}>Log Math Quizzes:</Text> Shows all
            Mathematics quizzes{"\n"}•{" "}
            <Text style={styles.instructionBold}>Initialize:</Text> Force initialize
            Drizzle database{"\n"}•{" "}
            <Text style={styles.instructionBold}>Check console:</Text> Open developer
            tools to see logs
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 32,
    gap: 24,
  },
  section: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusBox: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonLast: {
    marginBottom: 0,
  },
  buttonBlue: {
    backgroundColor: '#3b82f6',
  },
  buttonGreen: {
    backgroundColor: '#22c55e',
  },
  buttonYellow: {
    backgroundColor: '#eab308',
  },
  buttonRed: {
    backgroundColor: '#ef4444',
  },
  buttonRedDark: {
    backgroundColor: '#dc2626',
  },
  buttonPurple: {
    backgroundColor: '#a855f7',
  },
  buttonOrange: {
    backgroundColor: '#f97316',
  },
  buttonIndigo: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  buttonSubtext: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4,
  },
  buttonSubtextBlue: {
    color: '#dbeafe',
  },
  buttonSubtextGreen: {
    color: '#dcfce7',
  },
  buttonSubtextYellow: {
    color: '#fef9c3',
  },
  buttonSubtextRed: {
    color: '#fecaca',
  },
  buttonSubtextPurple: {
    color: '#f3e8ff',
  },
  buttonSubtextOrange: {
    color: '#fed7aa',
  },
  buttonSubtextIndigo: {
    color: '#e0e7ff',
  },
  infoContainer: {
    gap: 8,
  },
  infoText: {
    color: '#d1d5db',
  },
  infoLabel: {
    fontWeight: '600',
  },
  instructionText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 24,
  },
  instructionBold: {
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});