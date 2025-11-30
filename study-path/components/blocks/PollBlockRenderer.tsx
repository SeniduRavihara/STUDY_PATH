import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PollBlockData } from "../../types/contentBlocks";

interface PollBlockRendererProps {
  data: PollBlockData;
  onComplete: () => void;
}

export default function PollBlockRenderer({
  data,
  onComplete,
}: PollBlockRendererProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (index: number) => {
    if (submitted) return;

    if (data.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Mock results - in real app, fetch from backend
  const mockResults = data.options.map(
    (_, index) => Math.floor(Math.random() * 40) + 10
  );
  const totalVotes = mockResults.reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.questionContainer}>
        <Ionicons name="stats-chart" size={32} color="#8b5cf6" />
        <Text style={styles.questionText}>{data.question}</Text>
        <Text style={styles.subtitle}>
          {data.allowMultiple ? "Select all that apply" : "Select one option"}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const percentage = submitted
            ? Math.round((mockResults[index] / totalVotes) * 100)
            : 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && !submitted && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelectOption(index)}
              disabled={submitted}
            >
              {submitted && (
                <View
                  style={[styles.percentageBar, { width: `${percentage}%` }]}
                />
              )}
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  {data.allowMultiple ? (
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                  ) : (
                    <View
                      style={[styles.radio, isSelected && styles.radioSelected]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  )}
                </View>
                <Text style={styles.optionText}>{option}</Text>
                {submitted && (
                  <Text style={styles.percentageText}>{percentage}%</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View style={styles.resultsInfo}>
          <Ionicons name="people" size={20} color="#9ca3af" />
          <Text style={styles.resultsText}>{totalVotes} votes</Text>
        </View>
      )}

      {!submitted ? (
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedOptions.length === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedOptions.length === 0}
        >
          <Text style={styles.submitButtonText}>Submit Vote</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  questionContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  questionText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 30,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  optionButtonSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#2e1065",
  },
  percentageBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#8b5cf6",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#8b5cf6",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  optionText: {
    color: "#e5e7eb",
    fontSize: 16,
    flex: 1,
  },
  percentageText: {
    color: "#8b5cf6",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  resultsInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultsText: {
    color: "#9ca3af",
    fontSize: 14,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#334155",
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
