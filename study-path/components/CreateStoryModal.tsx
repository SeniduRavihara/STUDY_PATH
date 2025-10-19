import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
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
      <View className="flex-1 bg-black bg-opacity-50">
        <View className="flex-1 justify-end">
          <View className="bg-slate-900 rounded-t-3xl max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-slate-700">
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">Create Story</Text>
              <TouchableOpacity onPress={handleSubmit}>
                <Text className="text-blue-500 text-lg font-semibold">Share</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
              {/* Content Input */}
              <View className="mb-6">
                <Text className="text-white text-base font-semibold mb-3">
                  What's on your mind?
                </Text>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Share your study progress, achievements, or thoughts..."
                  placeholderTextColor="#6b7280"
                  multiline
                  className="bg-slate-800 text-white p-4 rounded-2xl text-base min-h-32"
                  style={{ textAlignVertical: 'top' }}
                  maxLength={200}
                />
                <Text className="text-gray-500 text-sm mt-2 text-right">
                  {content.length}/200
                </Text>
              </View>

              {/* Media Type Selection */}
              <View className="mb-6">
                <Text className="text-white text-base font-semibold mb-3">
                  Story Type
                </Text>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setMediaType('text')}
                    className={`flex-1 p-4 rounded-2xl mr-2 ${
                      mediaType === 'text' ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <View className="items-center">
                      <Ionicons
                        name="text"
                        size={24}
                        color={mediaType === 'text' ? 'white' : '#9ca3af'}
                      />
                      <Text
                        className={`mt-2 font-medium ${
                          mediaType === 'text' ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        Text Story
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMediaType('image')}
                    className={`flex-1 p-4 rounded-2xl ml-2 ${
                      mediaType === 'image' ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <View className="items-center">
                      <Ionicons
                        name="image"
                        size={24}
                        color={mediaType === 'image' ? 'white' : '#9ca3af'}
                      />
                      <Text
                        className={`mt-2 font-medium ${
                          mediaType === 'image' ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        Image Story
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gradient Selection */}
              <View className="mb-6">
                <Text className="text-white text-base font-semibold mb-3">
                  Background Color
                </Text>
                <View className="flex-row flex-wrap">
                  {gradientOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedGradient(option.colors)}
                      className="w-16 h-16 rounded-2xl mr-3 mb-3 overflow-hidden"
                    >
                      <LinearGradient
                        colors={option.colors}
                        className="w-full h-full items-center justify-center"
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
              <View className="mb-6">
                <Text className="text-white text-base font-semibold mb-3">
                  Preview
                </Text>
                <View className="h-48 rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={selectedGradient}
                    className="flex-1 items-center justify-center p-6"
                  >
                    <Text className="text-white text-lg font-semibold text-center">
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
