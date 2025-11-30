import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MCQBlockData } from "../../types/contentBlocks";

interface MCQBlockViewerProps {
  data: MCQBlockData;
  onAnswer?: (isCorrect: boolean) => void;
}

const MCQBlockViewer: React.FC<MCQBlockViewerProps> = ({ data, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(index);
    setShowExplanation(true);

    const isCorrect = index === data.correctAnswer;
    onAnswer?.(isCorrect);
  };

  const getOptionStyle = (index: number) => {
    if (selectedAnswer === null) {
      return styles.optionDefault;
    }

    if (index === data.correctAnswer) {
      return styles.optionCorrect;
    }

    if (index === selectedAnswer && index !== data.correctAnswer) {
      return styles.optionIncorrect;
    }

    return styles.optionDefault;
  };

  const getOptionIcon = (index: number) => {
    if (selectedAnswer === null) {
      return null;
    }

    if (index === data.correctAnswer) {
      return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
    }

    if (index === selectedAnswer && index !== data.correctAnswer) {
      return <Ionicons name="close-circle" size={24} color="#ef4444" />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{data.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, getOptionStyle(index)]}
            onPress={() => handleSelect(index)}
            disabled={selectedAnswer !== null}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}.
              </Text>
              <Text style={styles.optionText}>{option}</Text>
            </View>
            {getOptionIcon(index)}
          </TouchableOpacity>
        ))}
      </View>

      {/* Explanation */}
      {showExplanation && data.explanation && (
        <View style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <Ionicons name="bulb" size={20} color="#fbbf24" />
            <Text style={styles.explanationTitle}>Explanation</Text>
          </View>
          <Text style={styles.explanationText}>{data.explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  questionContainer: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionDefault: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
  },
  optionCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "#10b981",
  },
  optionIncorrect: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#ef4444",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#60a5fa",
    marginRight: 12,
    minWidth: 24,
  },
  optionText: {
    fontSize: 15,
    color: "#ffffff",
    flex: 1,
  },
  explanationContainer: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderLeftWidth: 4,
    borderLeftColor: "#fbbf24",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fbbf24",
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 20,
  },
});

export default MCQBlockViewer;
