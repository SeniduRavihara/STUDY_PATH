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

export default function HelpSupportScreen() {
  const faqItems = [
    {
      question: "How do I import quiz packs?",
      answer:
        "Go to the Feed tab, find quiz pack posts, and tap 'Import Quiz Pack' to add them to your local quizzes.",
    },
    {
      question: "How do I track my progress?",
      answer:
        "Your progress is automatically tracked in the Study tab. Check your statistics in the Profile tab.",
    },
    {
      question: "Can I use the app offline?",
      answer:
        "Yes! Once you import quiz packs, you can take quizzes offline. Your progress syncs when you're back online.",
    },
    {
      question: "How do I reset my progress?",
      answer:
        "Go to the Debug tab and use the 'Clear Database' button to reset all your local data.",
    },
  ];

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Choose how you'd like to contact us:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Email",
        onPress: () => Linking.openURL("mailto:support@studypath.app"),
      },
      {
        text: "Live Chat",
        onPress: () =>
          Alert.alert("Live Chat", "Live chat feature coming soon!"),
      },
    ]);
  };

  const handleRateApp = () => {
    Alert.alert(
      "Rate App",
      "Thank you for using StudyPath! Please rate us on the App Store.",
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      "Share App",
      "Share StudyPath with your friends and help them learn!",
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleContactSupport}
        >
          <View style={styles.actionContent}>
            <Ionicons name="chatbubble-outline" size={24} color="#3b82f6" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Contact Support</Text>
              <Text style={styles.actionSubtitle}>
                Get help from our team
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleRateApp}
        >
          <View style={styles.actionContent}>
            <Ionicons name="star-outline" size={24} color="#f59e0b" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Rate App</Text>
              <Text style={styles.actionSubtitle}>Share your feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleShareApp}
        >
          <View style={styles.actionContent}>
            <Ionicons name="share-outline" size={24} color="#10b981" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Share App</Text>
              <Text style={styles.actionSubtitle}>
                Tell your friends about us
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>
              {item.question}
            </Text>
            <Text style={styles.faqAnswer}>
              {item.answer}
            </Text>
          </View>
        ))}
      </View>

      {/* Resources Section */}
      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>Resources</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => Linking.openURL("https://studypath.app/privacy")}
        >
          <View style={styles.actionContent}>
            <Ionicons name="shield-outline" size={24} color="#6b7280" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Privacy Policy</Text>
              <Text style={styles.actionSubtitle}>
                How we protect your data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => Linking.openURL("https://studypath.app/terms")}
        >
          <View style={styles.actionContent}>
            <Ionicons name="document-text-outline" size={24} color="#6b7280" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Terms of Service</Text>
              <Text style={styles.actionSubtitle}>
                Our terms and conditions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => Linking.openURL("https://studypath.app/tutorials")}
        >
          <View style={styles.actionContent}>
            <Ionicons name="play-circle-outline" size={24} color="#6b7280" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Video Tutorials</Text>
              <Text style={styles.actionSubtitle}>
                Learn how to use the app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
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
  faqSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  faqCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
  },
  faqAnswer: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
  },
  resourcesSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
});