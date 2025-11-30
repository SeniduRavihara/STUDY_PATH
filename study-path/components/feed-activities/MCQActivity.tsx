import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityService } from "../../lib/activityService";

interface MCQOption {
  id: string;
  text: string;
}

interface MCQActivityProps {
  postId: string;
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation?: string;
}

export const MCQActivity: React.FC<MCQActivityProps> = ({
  postId,
  question,
  options,
  correctAnswer,
  explanation,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const checkCompletion = async () => {
    try {
      const response = await ActivityService.getUserActivityResponse(postId);
      if (response) {
        setSelectedOption(response.response_data.selectedOption);
        setShowResult(true);
      }
    } catch (error) {
      console.error("Error checking completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (showResult) return;

    setSelectedOption(optionId);
    setShowResult(true);

    // Calculate score
    const isCorrect = optionId === correctAnswer;
    const score = isCorrect ? 100 : 0;

    // Submit response
    try {
      await ActivityService.submitActivityResponse(
        postId,
        "mcq_single",
        { selectedOption: optionId },
        score
      );
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const isCorrect = selectedOption === correctAnswer;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === correctAnswer;
          const showCorrect = showResult && isCorrectOption;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                showCorrect && styles.correctOption,
                showIncorrect && styles.incorrectOption,
              ]}
              onPress={() => handleOptionSelect(option.id)}
              disabled={showResult}
            >
              <View
                style={[
                  styles.optionRadio,
                  isSelected && styles.selectedRadio,
                  showCorrect && styles.correctRadio,
                  showIncorrect && styles.incorrectRadio,
                ]}
              >
                {showCorrect && <Text style={styles.checkmark}>✓</Text>}
                {showIncorrect && <Text style={styles.crossmark}>✗</Text>}
              </View>

              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                  showCorrect && styles.correctOptionText,
                  showIncorrect && styles.incorrectOptionText,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showResult && (
        <View
          style={[
            styles.resultCard,
            isCorrect ? styles.correctCard : styles.incorrectCard,
          ]}
        >
          <Text style={styles.resultTitle}>
            {isCorrect ? "🎉 Correct!" : "❌ Incorrect"}
          </Text>

          {!isCorrect && (
            <Text style={styles.correctAnswerText}>
              Correct answer:{" "}
              {options.find((o) => o.id === correctAnswer)?.text}
            </Text>
          )}

          {explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}
        </View>
      )}

      {!showResult && (
        <Text style={styles.instruction}>Select an answer to submit</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1a1a1a",
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  correctOption: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  incorrectOption: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadio: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  correctRadio: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  incorrectRadio: {
    borderColor: "#F44336",
    backgroundColor: "#F44336",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  crossmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  correctOptionText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  incorrectOptionText: {
    color: "#F44336",
    fontWeight: "600",
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  correctCard: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  incorrectCard: {
    backgroundColor: "#FFEBEE",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  explanationContainer: {
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  instruction: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
