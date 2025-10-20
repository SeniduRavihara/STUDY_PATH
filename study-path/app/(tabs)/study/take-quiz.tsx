import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../superbase/supabase";
import { useAuth } from "../../../contexts/AuthContext";

type QuizResult = {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  correctAnswers: number;
  wrongAnswers: number;
};

export default function TakeQuizScreen() {
  const router = useRouter();
  const { quizId, quizTitle, quizPackId, subject } = useLocalSearchParams();
  const parsedSubject = subject ? JSON.parse(subject as string) : null;
  const { user } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load questions from database
  useEffect(() => {
    loadQuizQuestions();
  }, [quizPackId]);

  const loadQuizQuestions = useCallback(async () => {
    if (!quizPackId || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load quiz pack details
      const { data: quizPackData, error: quizPackError } = await supabase
        .from("quiz_packs")
        .select("*")
        .eq("id", quizPackId)
        .single();
      
      if (quizPackError) {
        console.error("Error loading quiz pack:", quizPackError);
        Alert.alert("Error", "Failed to load quiz pack");
        return;
      }
      
      // Load MCQs for this quiz pack
      if (quizPackData.mcq_ids && quizPackData.mcq_ids.length > 0) {
        const { data: mcqs, error: mcqsError } = await supabase
          .from("mcqs")
          .select("*")
          .in("id", quizPackData.mcq_ids)
          .order("created_at");
        
        if (mcqsError) {
          console.error("Error loading MCQs:", mcqsError);
          Alert.alert("Error", "Failed to load quiz questions");
          return;
        }
        
        setQuestions(mcqs || []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error loading quiz questions:", error);
      Alert.alert("Error", "Failed to load quiz questions");
    } finally {
      setLoading(false);
    }
  }, [quizPackId, user?.id]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isQuizComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isQuizComplete) {
      completeQuiz();
    }
  }, [timeLeft, isQuizComplete, completeQuiz]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert(
        "Please select an answer",
        "You must choose an answer before continuing.",
      );
      return;
    }

    // Save the answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = useCallback(async () => {
    try {
      const results = calculateResults();
      
      // Save quiz attempt to database (you can create a quiz_attempts table later)
      console.log("Quiz completed:", {
        quizId: quizId,
        quizPackId: quizPackId,
        userId: user?.id,
        score: results.score,
        timeTaken: 30 * 60 - timeLeft,
        answers: answers,
        questions: questions.length
      });

      setIsQuizComplete(true);
      setShowResults(true);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      // Still show results even if saving fails
      setIsQuizComplete(true);
      setShowResults(true);
    }
  }, [answers, quizId, quizPackId, user?.id, questions, timeLeft]);

  const calculateResults = (): QuizResult => {
    let correctAnswers = 0;
    answers.forEach((answerIndex, questionIndex) => {
      const question = questions[questionIndex];
      // correct_answer is an index (0-based), not a letter
      if (answerIndex === question.correct_answer) {
        correctAnswers++;
      }
    });

    return {
      score: Math.round((correctAnswers / questions.length) * 100),
      totalQuestions: questions.length,
      timeTaken: 30 * 60 - timeLeft,
      correctAnswers,
      wrongAnswers: questions.length - correctAnswers,
    };
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0f0f23", "#1a1a2e", "#16213e"]}
          style={styles.flex1}
        >
          {/* Header */}
          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeaderRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.flex1}>
                <Text style={styles.resultsTitle}>
                  Quiz Results
                </Text>
                <Text style={styles.resultsSubtitle}>How did you do?</Text>
              </View>
            </View>
          </View>

          {/* Results Content */}
          <ScrollView style={[styles.flex1, styles.scrollPadding]}>
            <View style={styles.resultsScoreSection}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>
                  {results.score}%
                </Text>
                <Text style={styles.scoreLabel}>Your Score</Text>
              </View>

              {/* Performance Badge */}
              <View style={styles.performanceBadge}>
                <Text style={styles.performanceBadgeText}>
                  {results.score >= 80
                    ? "🏆 Excellent Performance!"
                    : results.score >= 60
                      ? "👍 Good Job!"
                      : "📚 Keep Learning!"}
                </Text>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Correct Answers</Text>
                  <Text style={styles.statValue}>
                    {results.correctAnswers}/{results.totalQuestions}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarGreen,
                      {
                        width: `${(results.correctAnswers / results.totalQuestions) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Time Taken</Text>
                  <Text style={styles.statValue}>
                    {formatTime(results.timeTaken)}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarBlue,
                      {
                        width: `${((30 * 60 - results.timeTaken) / (30 * 60)) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>
                    {Math.round(
                      (results.correctAnswers / results.totalQuestions) * 100,
                    )}
                    %
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarYellow,
                      {
                        width: `${(results.correctAnswers / results.totalQuestions) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsSection}>
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => setShowResults(false)}
              >
                <Text style={styles.reviewButtonText}>
                  🔍 Review Answers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToQuizzesButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backToQuizzesButtonText}>
                  📚 Back to Quizzes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={parsedSubject?.color || ['#3B82F6', '#3B82F6']} style={styles.flex1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>
              Loading Quiz...
            </Text>
            <Text style={styles.loadingSubtitle}>
              Please wait while we prepare your questions
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={parsedSubject?.color || ['#3B82F6', '#3B82F6']} style={styles.flex1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>
              No Questions Available
            </Text>
            <Text style={styles.loadingSubtitle}>
              This quiz doesn't have any questions yet
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (loading || !currentQuestion) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          No Questions Available
        </Text>
        <Text style={styles.errorSubtitle}>
          This quiz doesn't have any questions yet.
        </Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={parsedSubject?.color || ['#3B82F6', '#3B82F6']} style={styles.quizHeader}>
        <View style={styles.quizHeaderRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.quizHeaderCenter}>
            <Text style={styles.questionCountText}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <Text style={styles.quizTitleText}>
              {quizTitle || "Quiz"}
            </Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.headerProgressBarBg}>
          <View
            style={[
              styles.headerProgressBar,
              {
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </LinearGradient>

      {/* Question */}
      <ScrollView style={styles.quizContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsSection}>
          {currentQuestion.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                selectedAnswer === index
                  ? styles.optionCardSelected
                  : styles.optionCardUnselected,
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.radioButton,
                    selectedAnswer === index
                      ? styles.radioButtonSelected
                      : styles.radioButtonUnselected,
                  ]}
                >
                  {selectedAnswer === index && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.optionText}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.previousButton,
              currentQuestionIndex === 0 && styles.buttonDisabled,
            ]}
            onPress={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.buttonText}>
              {currentQuestionIndex === questions.length - 1
                ? "Finish"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  flex1: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: 24,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  resultsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 9999,
    marginRight: 16,
  },
  resultsTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  resultsSubtitle: {
    color: "white",
    opacity: 0.8,
  },
  resultsScoreSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: "#1e293b",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  scoreValue: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scoreLabel: {
    color: "#d1d5db",
    fontSize: 18,
  },
  performanceBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  performanceBadgeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  statsSection: {
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    color: "#d1d5db",
    fontSize: 18,
  },
  statValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  progressBarBg: {
    backgroundColor: "#334155",
    borderRadius: 9999,
    height: 8,
  },
  progressBarGreen: {
    backgroundColor: "#4ade80",
    borderRadius: 9999,
    height: 8,
  },
  progressBarBlue: {
    backgroundColor: "#60a5fa",
    borderRadius: 9999,
    height: 8,
  },
  progressBarYellow: {
    backgroundColor: "#fbbf24",
    borderRadius: 9999,
    height: 8,
  },
  actionButtonsSection: {
    marginBottom: 32,
  },
  reviewButton: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  backToQuizzesButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  backToQuizzesButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loadingSubtitle: {
    color: "white",
    opacity: 0.8,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  errorSubtitle: {
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  goBackButtonText: {
    color: "white",
    fontWeight: "600",
  },
  quizHeader: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  quizHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quizHeaderCenter: {
    alignItems: "center",
  },
  questionCountText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  quizTitleText: {
    color: "white",
    opacity: 0.8,
    fontSize: 14,
  },
  timerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  timerText: {
    color: "white",
    fontWeight: "bold",
  },
  headerProgressBarBg: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 9999,
    height: 8,
  },
  headerProgressBar: {
    backgroundColor: "white",
    borderRadius: 9999,
    height: 8,
  },
  quizContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  questionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  questionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  optionsSection: {
    marginBottom: 32,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  optionCardSelected: {
    borderColor: "#60a5fa",
    backgroundColor: "rgba(96, 165, 250, 0.2)",
  },
  optionCardUnselected: {
    borderColor: "#334155",
    backgroundColor: "#1e293b",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 2,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#60a5fa",
    backgroundColor: "#60a5fa",
  },
  radioButtonUnselected: {
    borderColor: "#475569",
  },
  optionText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  previousButton: {
    backgroundColor: "#334155",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  nextButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});