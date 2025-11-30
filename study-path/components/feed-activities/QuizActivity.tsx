import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityService } from "../../lib/activityService";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correct_answer: string;
  explanation?: string;
}

interface QuizActivityProps {
  postId: string;
  title: string;
  questions: QuizQuestion[];
}

export const QuizActivity: React.FC<QuizActivityProps> = ({
  postId,
  title,
  questions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    checkCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const checkCompletion = async () => {
    try {
      const response = await ActivityService.getUserActivityResponse(postId);
      if (response) {
        setAnswers(response.response_data.answers || {});
        setScore(response.score || 0);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error checking completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (showResults) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    const correct = questions.filter(
      (q) => answers[q.id] === q.correct_answer
    ).length;
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Submit to backend
    try {
      await ActivityService.submitActivityResponse(
        postId,
        "quiz",
        { answers },
        finalScore,
        timeSpent
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const isAnswerCorrect = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    return answers[questionId] === question?.correct_answer;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {!showResults ? (
        <>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.option, isSelected && styles.selectedOption]}
                    onPress={() =>
                      handleAnswerSelect(currentQuestion.id, option.id)
                    }
                  >
                    <View
                      style={[
                        styles.optionRadio,
                        isSelected && styles.selectedRadio,
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentQuestionIndex === 0 && styles.disabledButton,
              ]}
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                !answers[currentQuestion.id] && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                {currentQuestionIndex === questions.length - 1
                  ? "Submit"
                  : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Your Score</Text>
            <Text style={styles.scoreValue}>{score}%</Text>
            <Text style={styles.scoreSubtext}>
              {questions.filter((q) => isAnswerCorrect(q.id)).length} out of{" "}
              {questions.length} correct
            </Text>
          </View>

          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Answers</Text>

            {questions.map((question, index) => {
              const isCorrect = isAnswerCorrect(question.id);

              return (
                <View key={question.id} style={styles.reviewQuestion}>
                  <Text style={styles.reviewQuestionNumber}>
                    Question {index + 1}
                  </Text>
                  <Text style={styles.reviewQuestionText}>
                    {question.question}
                  </Text>

                  <View style={styles.reviewAnswerContainer}>
                    <View
                      style={[
                        styles.reviewAnswerBadge,
                        isCorrect ? styles.correctBadge : styles.incorrectBadge,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </Text>
                    </View>

                    {!isCorrect && (
                      <Text style={styles.correctAnswerText}>
                        Correct answer:{" "}
                        {
                          question.options.find(
                            (o) => o.id === question.correct_answer
                          )?.text
                        }
                      </Text>
                    )}

                    {question.explanation && (
                      <Text style={styles.explanationText}>
                        {question.explanation}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    minHeight: 400,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  progress: {
    fontSize: 14,
    color: "#666",
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 20,
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
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 12,
  },
  selectedRadio: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
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
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  nextButtonText: {
    color: "#fff",
  },
  resultsContainer: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: "#4CAF50",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  scoreSubtext: {
    fontSize: 14,
    color: "#fff",
    marginTop: 8,
  },
  reviewSection: {
    marginTop: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  reviewQuestion: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  reviewQuestionNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  reviewQuestionText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 12,
  },
  reviewAnswerContainer: {
    gap: 8,
  },
  reviewAnswerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  correctBadge: {
    backgroundColor: "#4CAF50",
  },
  incorrectBadge: {
    backgroundColor: "#F44336",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  correctAnswerText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  explanationText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginTop: 4,
  },
});
