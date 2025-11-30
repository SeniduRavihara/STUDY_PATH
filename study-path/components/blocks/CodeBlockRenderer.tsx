import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CodeBlockData } from "../../types/contentBlocks";

interface CodeBlockRendererProps {
  data: CodeBlockData;
  onComplete: () => void;
}

export default function CodeBlockRenderer({
  data,
  onComplete,
}: CodeBlockRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        {data.title && <Text style={styles.title}>{data.title}</Text>}

        <View style={styles.codeWrapper}>
          <View style={styles.codeHeader}>
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>{data.language}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={18}
                color={copied ? "#10b981" : "#9ca3af"}
              />
              <Text style={[styles.copyText, copied && styles.copyTextSuccess]}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.codeScrollView}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.codeText}>{data.code}</Text>
            </ScrollView>
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  codeContainer: {
    flex: 1,
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  codeWrapper: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  languageBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  languageText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  copyText: {
    color: "#9ca3af",
    fontSize: 14,
    marginLeft: 6,
  },
  copyTextSuccess: {
    color: "#10b981",
  },
  codeScrollView: {
    flex: 1,
  },
  codeText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontFamily: "monospace",
    padding: 16,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
