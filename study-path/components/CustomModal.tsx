import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  estimatedTime?: string;
  type: "lesson" | "quiz" | "project" | "milestone";
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  description,
  estimatedTime,
  type,
  onConfirm,
  confirmText = "Start",
  cancelText = "Cancel",
  showCancel = true,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case "lesson":
        return "book";
      case "quiz":
        return "help-circle";
      case "project":
        return "rocket";
      case "milestone":
        return "trophy";
      default:
        return "book";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "lesson":
        return ["#667eea", "#764ba2"];
      case "quiz":
        return ["#f093fb", "#f5576c"];
      case "project":
        return ["#667eea", "#764ba2"];
      case "milestone":
        return ["#FFD700", "#FFA500"];
      default:
        return ["#667eea", "#764ba2"];
    }
  };

  const getTypeText = () => {
    switch (type) {
      case "lesson":
        return "Lesson";
      case "quiz":
        return "Quiz";
      case "project":
        return "Project";
      case "milestone":
        return "Milestone";
      default:
        return "Content";
    }
  };

  const typeColor = getTypeColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <LinearGradient
                colors={typeColor}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name={getTypeIcon() as any}
                      size={24}
                      color="white"
                    />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.typeTitle}>
                      {getTypeText()}
                    </Text>
                    <Text style={styles.estimatedTime}>
                      {estimatedTime && `Estimated time: ${estimatedTime}`}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Content */}
              <View style={styles.contentContainer}>
                <Text style={styles.title}>
                  {title}
                </Text>
                <Text style={styles.description}>
                  {description}
                </Text>

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  {showCancel && (
                    <>
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelButtonText}>
                          {cancelText}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.buttonSpacer} />
                    </>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                    style={styles.confirmButtonWrapper}
                  >
                    <LinearGradient
                      colors={typeColor}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.confirmButton}
                    >
                      <Text style={styles.confirmButtonText}>
                        {confirmText}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    width: "100%",
    maxWidth: 380,
    overflow: "hidden",
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  typeTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  estimatedTime: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    color: "#d1d5db",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#475569",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  buttonSpacer: {
    width: 12,
  },
  confirmButtonWrapper: {
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default CustomModal;