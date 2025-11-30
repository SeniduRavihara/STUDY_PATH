import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface FlashcardActivityProps {
  postId: string;
  title: string;
  cards: Flashcard[];
}

export const FlashcardActivity: React.FC<FlashcardActivityProps> = ({
  postId,
  title,
  cards,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));

  const currentCard = cards[currentCardIndex];

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  // Swipe gestures
  const swipeGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationX > 100) {
      handlePrevious();
    } else if (event.translationX < -100) {
      handleNext();
    }
  });

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.progress}>
          Card {currentCardIndex + 1} of {cards.length}
        </Text>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={handleFlip}
          activeOpacity={0.9}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                transform: [{ rotateY: frontRotate }],
                opacity: frontOpacity,
              },
            ]}
          >
            <Text style={styles.cardLabel}>Question</Text>
            <Text style={styles.cardText}>{currentCard.front}</Text>
            {currentCard.hint && !isFlipped && (
              <Text style={styles.hintText}>💡 {currentCard.hint}</Text>
            )}
            <Text style={styles.tapToFlip}>Tap to reveal answer</Text>
          </Animated.View>

          {/* Back of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                transform: [{ rotateY: backRotate }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={styles.cardLabel}>Answer</Text>
            <Text style={styles.cardText}>{currentCard.back}</Text>
            <Text style={styles.tapToFlip}>Tap to flip back</Text>
          </Animated.View>
        </TouchableOpacity>
      </GestureDetector>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentCardIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={currentCardIndex === 0}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentCardIndex === cards.length - 1 && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={currentCardIndex === cards.length - 1}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.swipeHint}>← Swipe to navigate →</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
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
  cardContainer: {
    height: 300,
    marginVertical: 20,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: "#007AFF",
  },
  cardBack: {
    backgroundColor: "#4CAF50",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  cardText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 32,
  },
  hintText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  tapToFlip: {
    position: "absolute",
    bottom: 20,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  swipeHint: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 12,
    fontStyle: "italic",
  },
});
