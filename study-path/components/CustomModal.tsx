import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <TouchableWithoutFeedback>
            <View className="bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden">
              {/* Header */}
              <LinearGradient
                colors={getTypeColor()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                    <Ionicons
                      name={getTypeIcon() as any}
                      size={24}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                      {getTypeText()}
                    </Text>
                    <Text className="text-white/80 text-sm">
                      {estimatedTime && `Estimated time: ${estimatedTime}`}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Content */}
              <View className="p-6">
                <Text className="text-white text-xl font-semibold mb-3">
                  {title}
                </Text>
                <Text className="text-gray-300 text-base leading-6 mb-6">
                  {description}
                </Text>

                {/* Action Buttons */}
                <View className="flex-row">
                  {showCancel && (
                    <>
                      <TouchableOpacity
                        onPress={onClose}
                        className="flex-1 bg-slate-700 py-4 rounded-2xl items-center"
                      >
                        <Text className="text-white font-medium">
                          {cancelText}
                        </Text>
                      </TouchableOpacity>
                      <View className="w-3" />
                    </>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                    className="flex-1"
                  >
                    <LinearGradient
                      colors={getTypeColor()}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="py-4 rounded-2xl items-center"
                    >
                      <Text className="text-white font-semibold">
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

export default CustomModal;
