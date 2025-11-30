import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MCQBlockData } from "../../types/contentBlocks";

interface MCQBlockRendererProps {
  data: MCQBlockData;
  onComplete: () => void;
}

export default function MCQBlockRenderer({
  data,
  onComplete,
}: MCQBlockRendererProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === data.correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleContinue = () => {
    if (isCorrect) {
      onComplete();
    } else {
      // Reset for retry
      setSelectedOption(null);
      setSubmitted(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{data.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectOption = index === data.correctAnswer;
          const showCorrect = submitted && isCorrectOption;
          const showIncorrect = submitted && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && !submitted && styles.optionButtonSelected,
                showCorrect && styles.optionButtonCorrect,
                showIncorrect && styles.optionButtonIncorrect,
              ]}
              onPress={() => !submitted && setSelectedOption(index)}
              disabled={submitted}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.radio,
                    isSelected && !submitted && styles.radioSelected,
                    showCorrect && styles.radioCorrect,
                    showIncorrect && styles.radioIncorrect,
                  ]}
                >
                  {isSelected && !submitted && (
                    <View style={styles.radioInner} />
                  )}
                  {showCorrect && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                  {showIncorrect && (
                    <Ionicons name="close" size={16} color="#ffffff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    (showCorrect || showIncorrect) && styles.optionTextBold,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View
          style={[
            styles.feedbackContainer,
            isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
          ]}
        >
          <View style={styles.feedbackHeader}>
            <Ionicons
              name={isCorrect ? "checkmark-circle" : "close-circle"}
              size={24}
              color={isCorrect ? "#10b981" : "#ef4444"}
            />
            <Text style={styles.feedbackTitle}>
              {isCorrect ? "Correct!" : "Not quite right"}
            </Text>
          </View>
          {data.explanation && (
            <Text style={styles.explanationText}>{data.explanation}</Text>
          )}
        </View>
      )}

      {!submitted ? (
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedOption === null && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedOption === null}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.continueButton,
            isCorrect
              ? styles.continueButtonCorrect
              : styles.continueButtonRetry,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {isCorrect ? "Continue" : "Try Again"}
          </Text>
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
    marginBottom: 24,
  },
  questionText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
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
  },
  optionButtonSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#1e3a8a",
  },
  optionButtonCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#064e3b",
  },
  optionButtonIncorrect: {
    borderColor: "#ef4444",
    backgroundColor: "#7f1d1d",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#64748b",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#3b82f6",
  },
  radioCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#10b981",
  },
  radioIncorrect: {
    borderColor: "#ef4444",
    backgroundColor: "#ef4444",
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
  optionTextBold: {
    fontWeight: "600",
  },
  feedbackContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  feedbackCorrect: {
    backgroundColor: "#064e3b",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  feedbackIncorrect: {
    backgroundColor: "#7f1d1d",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  explanationText: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#3b82f6",
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonCorrect: {
    backgroundColor: "#10b981",
  },
  continueButtonRetry: {
    backgroundColor: "#f59e0b",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
