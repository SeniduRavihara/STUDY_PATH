import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MCQData, MCQPackBlockData } from "../../types/contentBlocks";

interface MCQPackBlockRendererProps {
  data: MCQPackBlockData;
  onComplete: () => void;
}

export default function MCQPackBlockRenderer({
  data,
  onComplete,
}: MCQPackBlockRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(data.mcqs.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = data.mcqs[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const totalQuestions = data.mcqs.length;

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    data.mcqs.forEach((mcq: MCQData, index: number) => {
      if (answers[index] === mcq.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Ionicons
              name={percentage >= 70 ? "trophy" : "ribbon"}
              size={64}
              color={percentage >= 70 ? "#fbbf24" : "#3b82f6"}
            />
            <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreText}>{percentage}%</Text>
            <Text style={styles.scoreSubtext}>
              {score} out of {totalQuestions} correct
            </Text>
          </View>

          <View style={styles.resultsList}>
            {data.mcqs.map((mcq: MCQData, index: number) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === mcq.correctAnswer;

              return (
                <View key={index} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Ionicons
                      name={isCorrect ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={isCorrect ? "#10b981" : "#ef4444"}
                    />
                    <Text style={styles.resultQuestion}>
                      Question {index + 1}
                    </Text>
                  </View>
                  {!isCorrect && mcq.explanation && (
                    <Text style={styles.resultExplanation}>
                      {mcq.explanation}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        {data.description && (
          <Text style={styles.description}>{data.description}</Text>
        )}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    ((currentQuestionIndex + 1) / totalQuestions) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Question */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option: string, index: number) => {
            const isSelected = currentAnswer === index;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelectOption(index)}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePrevious}
          >
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            currentAnswer === null && styles.nextButtonDisabled,
            currentQuestionIndex === 0 && styles.nextButtonFull,
          ]}
          onPress={handleNext}
          disabled={currentAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === totalQuestions - 1
              ? "Submit Quiz"
              : "Next Question"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  questionText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 20,
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
  navigation: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#1e293b",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    gap: 12,
  },
  previousButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#334155",
    borderRadius: 12,
  },
  previousButtonText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: "#334155",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },
  resultsContainer: {
    alignItems: "center",
  },
  resultsHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  resultsTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
  },
  scoreCard: {
    backgroundColor: "#1e293b",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  scoreText: {
    color: "#3b82f6",
    fontSize: 64,
    fontWeight: "700",
  },
  scoreSubtext: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 8,
  },
  resultsList: {
    width: "100%",
    marginBottom: 32,
  },
  resultItem: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultQuestion: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultExplanation: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
    marginLeft: 28,
  },
  completeButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
