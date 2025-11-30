import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityService, PollResults } from "../../lib/activityService";

interface PollOption {
  id: string;
  text: string;
}

interface PollActivityProps {
  postId: string;
  question: string;
  options: PollOption[];
  allowMultiple?: boolean;
}

export const PollActivity: React.FC<PollActivityProps> = ({
  postId,
  question,
  options,
  allowMultiple = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState<PollResults[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPollData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadPollData = async () => {
    try {
      setLoading(true);

      // Check if user has already voted
      const { voted, option_id } = await ActivityService.hasUserVoted(postId);
      setHasVoted(voted);

      if (voted) {
        setSelectedOption(option_id || null);
        // Load results if already voted
        const pollResults = await ActivityService.getPollResults(postId);
        setResults(pollResults);
      }
    } catch (error) {
      console.error("Error loading poll data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted) return;

    try {
      setLoading(true);
      await ActivityService.submitPollVote(postId, optionId);
      setSelectedOption(optionId);
      setHasVoted(true);

      // Load results after voting
      const pollResults = await ActivityService.getPollResults(postId);
      setResults(pollResults);
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOptionResult = (optionId: string) => {
    return results.find((r) => r.option_id === optionId);
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
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const result = getOptionResult(option.id);
          const isSelected = selectedOption === option.id;
          const percentage = result?.percentage || 0;
          const voteCount = result?.vote_count || 0;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                hasVoted && styles.votedOption,
              ]}
              onPress={() => handleVote(option.id)}
              disabled={hasVoted}
            >
              {hasVoted && (
                <View style={[styles.resultBar, { width: `${percentage}%` }]} />
              )}

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {option.text}
                </Text>

                {hasVoted && (
                  <View style={styles.resultInfo}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                    <Text style={styles.voteCountText}>
                      ({voteCount} votes)
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!hasVoted && (
        <Text style={styles.instruction}>Tap an option to vote</Text>
      )}

      {hasVoted && <Text style={styles.thankYou}>Thank you for voting!</Text>}
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
    marginBottom: 16,
    color: "#1a1a1a",
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    position: "relative",
    overflow: "hidden",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  votedOption: {
    borderColor: "#4CAF50",
  },
  resultBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
    opacity: 0.2,
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: "600",
    color: "#007AFF",
  },
  resultInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  voteCountText: {
    fontSize: 12,
    color: "#666",
  },
  instruction: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  thankYou: {
    marginTop: 12,
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    fontWeight: "600",
  },
});
