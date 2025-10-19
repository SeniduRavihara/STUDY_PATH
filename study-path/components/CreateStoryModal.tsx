import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateStoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string, mediaType: 'text' | 'image', gradient?: [string, string]) => void;
}

const gradientOptions: { name: string; colors: [string, string] }[] = [
  { name: 'Purple', colors: ['#667eea', '#764ba2'] },
  { name: 'Pink', colors: ['#f093fb', '#f5576c'] },
  { name: 'Blue', colors: ['#4facfe', '#00f2fe'] },
  { name: 'Green', colors: ['#43e97b', '#38f9d7'] },
  { name: 'Orange', colors: ['#fa709a', '#fee140'] },
  { name: 'Red', colors: ['#ff6b6b', '#ee5a24'] },
  { name: 'Yellow', colors: ['#f9ca24', '#f0932b'] },
  { name: 'Indigo', colors: ['#a8edea', '#fed6e3'] },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState<[string, string]>(gradientOptions[0].colors);
  const [mediaType, setMediaType] = useState<'text' | 'image'>('text');

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your story');
      return;
    }

    onSubmit(content.trim(), mediaType, selectedGradient);
    setContent('');
    setSelectedGradient(gradientOptions[0].colors);
    setMediaType('text');
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setSelectedGradient(gradientOptions[0].colors);
    setMediaType('text');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Story</Text>
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.headerButton}>Share</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {/* Content Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  What's on your mind?
                </Text>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Share your study progress, achievements, or thoughts..."
                  placeholderTextColor="#6b7280"
                  multiline
                  style={styles.textInput}
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text style={styles.charCount}>
                  {content.length}/200
                </Text>
              </View>

              {/* Media Type Selection */}
              <View style={styles.mediaTypeSection}>
                <Text style={styles.mediaTypeLabel}>
                  Story Type
                </Text>
                <View style={styles.mediaTypeButtons}>
                  <TouchableOpacity
                    onPress={() => setMediaType('text')}
                    style={[
                      styles.mediaTypeButton,
                      styles.mediaTypeButtonLeft,
                      mediaType === 'text' ? styles.mediaTypeButtonActive : styles.mediaTypeButtonInactive
                    ]}
                  >
                    <View style={styles.mediaTypeButtonContent}>
                      <Ionicons
                        name="text"
                        size={24}
                        color={mediaType === 'text' ? 'white' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.mediaTypeButtonText,
                          mediaType === 'text' ? styles.mediaTypeButtonTextActive : styles.mediaTypeButtonTextInactive
                        ]}
                      >
                        Text Story
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMediaType('image')}
                    style={[
                      styles.mediaTypeButton,
                      styles.mediaTypeButtonRight,
                      mediaType === 'image' ? styles.mediaTypeButtonActive : styles.mediaTypeButtonInactive
                    ]}
                  >
                    <View style={styles.mediaTypeButtonContent}>
                      <Ionicons
                        name="image"
                        size={24}
                        color={mediaType === 'image' ? 'white' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.mediaTypeButtonText,
                          mediaType === 'image' ? styles.mediaTypeButtonTextActive : styles.mediaTypeButtonTextInactive
                        ]}
                      >
                        Image Story
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gradient Selection */}
              <View style={styles.gradientSection}>
                <Text style={styles.gradientLabel}>
                  Background Color
                </Text>
                <View style={styles.gradientGrid}>
                  {gradientOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedGradient(option.colors)}
                      style={styles.gradientOption}
                    >
                      <LinearGradient
                        colors={option.colors}
                        style={styles.gradientOptionGradient}
                      >
                        {selectedGradient[0] === option.colors[0] && (
                          <Ionicons name="checkmark" size={20} color="white" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>
                  Preview
                </Text>
                <View style={styles.previewContainer}>
                  <LinearGradient
                    colors={selectedGradient}
                    style={styles.previewGradient}
                  >
                    <Text style={styles.previewText}>
                      {content || 'Your story content will appear here...'}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    minHeight: 128,
  },
  charCount: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },
  mediaTypeSection: {
    marginBottom: 24,
  },
  mediaTypeLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  mediaTypeButtons: {
    flexDirection: 'row',
  },
  mediaTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  mediaTypeButtonLeft: {
    marginRight: 8,
  },
  mediaTypeButtonRight: {
    marginLeft: 8,
  },
  mediaTypeButtonActive: {
    backgroundColor: '#2563eb',
  },
  mediaTypeButtonInactive: {
    backgroundColor: '#1e293b',
  },
  mediaTypeButtonContent: {
    alignItems: 'center',
  },
  mediaTypeButtonText: {
    marginTop: 8,
    fontWeight: '500',
  },
  mediaTypeButtonTextActive: {
    color: 'white',
  },
  mediaTypeButtonTextInactive: {
    color: '#9ca3af',
  },
  gradientSection: {
    marginBottom: 24,
  },
  gradientLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gradientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradientOption: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  gradientOptionGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSection: {
    marginBottom: 24,
  },
  previewLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewContainer: {
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  previewText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
