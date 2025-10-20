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
        <View style={styles.containerWrapper}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Story</Text>
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.shareButton}>Share</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Content Input */}
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>
                  What's on your mind?
                </Text>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Share your study progress, achievements, or thoughts..."
                  placeholderTextColor="#6b7280"
                  multiline
                  style={styles.textInput}
                  maxLength={200}
                />
                <Text style={styles.charCount}>
                  {content.length}/200
                </Text>
              </View>

              {/* Media Type Selection */}
              <View style={styles.mediaTypeSection}>
                <Text style={styles.sectionTitle}>
                  Story Type
                </Text>
                <View style={styles.mediaTypeRow}>
                  <TouchableOpacity
                    onPress={() => setMediaType('text')}
                    style={[
                      styles.mediaTypeButton,
                      mediaType === 'text' && styles.mediaTypeButtonActive,
                    ]}
                  >
                    <View style={styles.mediaTypeContent}>
                      <Ionicons
                        name="text"
                        size={24}
                        color={mediaType === 'text' ? 'white' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.mediaTypeLabel,
                          mediaType === 'text' ? styles.mediaTypeLabelActive : styles.mediaTypeLabelInactive,
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
                      mediaType === 'image' && styles.mediaTypeButtonActive,
                    ]}
                  >
                    <View style={styles.mediaTypeContent}>
                      <Ionicons
                        name="image"
                        size={24}
                        color={mediaType === 'image' ? 'white' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.mediaTypeLabel,
                          mediaType === 'image' ? styles.mediaTypeLabelActive : styles.mediaTypeLabelInactive,
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
                <Text style={styles.sectionTitle}>
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
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBox}
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
                <Text style={styles.sectionTitle}>
                  Preview
                </Text>
                <View style={styles.previewContainer}>
                  <LinearGradient
                    colors={selectedGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  containerWrapper: {
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    fontSize: 16,
    minHeight: 128,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },
  mediaTypeSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  mediaTypeRow: {
    flexDirection: 'row',
  },
  mediaTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    marginHorizontal: 8,
  },
  mediaTypeButtonActive: {
    backgroundColor: '#2563eb',
  },
  mediaTypeContent: {
    alignItems: 'center',
  },
  mediaTypeLabel: {
    marginTop: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  mediaTypeLabelActive: {
    color: '#ffffff',
  },
  mediaTypeLabelInactive: {
    color: '#9ca3af',
  },
  gradientSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
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
  gradientBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSection: {
    marginBottom: 48,
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
  },
  previewText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CreateStoryModal;