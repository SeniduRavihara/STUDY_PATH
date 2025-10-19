import React, { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Image, Dimensions, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.35;
const cardHeight = cardWidth * 1.4;

// Mock data
const mockStories = [
  {
    id: 'add-story',
    isOwn: true,
    userName: 'Your Story',
  },
  {
    id: '1',
    userName: 'Juliette Schmidt',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    content: 'Just aced my calculus exam! 🎉',
    mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',
    timestamp: '2h',
    viewCount: 24,
  },
  {
    id: '2',
    userName: 'Big Bro',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Physics lab breakthrough!',
    mediaUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop',
    timestamp: '4h',
    viewCount: 18,
  },
  {
    id: '3',
    userName: 'Bhavin Salazar',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'Chemistry experiment success!',
    mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    timestamp: '6h',
    viewCount: 32,
    isViewed: true,
  },
  {
    id: '4',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'Study group session productive!',
    mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop',
    timestamp: '8h',
    viewCount: 15,
  },
];

const SimpleStoriesSection = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleStoryPress = (story: any) => {
    if (story.isOwn) {
      console.log('Create story pressed');
    } else {
      setSelectedStory(story);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedStory(null);
  };

  return (
    <View style={{ backgroundColor: '#0f172a', paddingVertical: 12 }}>
      <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Stories</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
      >
        {mockStories.map((story) => (
          <TouchableOpacity
            key={story.id}
            onPress={() => handleStoryPress(story)}
            activeOpacity={0.9}
            style={{ width: cardWidth, marginRight: 12 }}
          >
            <View 
              style={{ 
                height: cardHeight,
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {story.isOwn ? (
                // Add Story Card
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      backgroundColor: 'white', 
                      borderRadius: 24, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: 8
                    }}>
                      <Ionicons name="add" size={28} color="#667eea" />
                    </View>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Add Story</Text>
                  </View>
                </LinearGradient>
              ) : (
                // Regular Story Card
                <View style={{ flex: 1, position: 'relative' }}>
                  {/* Background Image */}
                  <Image
                    source={{ uri: story.mediaUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {/* Dark Overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  />

                  {/* Profile Picture */}
                  <View style={{ position: 'absolute', top: 12, left: 12 }}>
                    <View style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 20, 
                      overflow: 'hidden', 
                      borderWidth: 2, 
                      borderColor: 'white' 
                    }}>
                      <Image
                        source={{ uri: story.userAvatar }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>

                  {/* Viewed Indicator */}
                  {story.isViewed && (
                    <View style={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12, 
                      backgroundColor: 'rgba(0,0,0,0.5)', 
                      borderRadius: 12, 
                      padding: 4 
                    }}>
                      <Ionicons name="checkmark-done" size={16} color="#9ca3af" />
                    </View>
                  )}

                  {/* Bottom Content */}
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 4 }} numberOfLines={1}>
                      {story.userName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: 'white', fontSize: 14, opacity: 0.8 }} numberOfLines={1}>
                        {story.content}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                        <Text style={{ color: 'white', fontSize: 12, opacity: 0.6, marginRight: 8 }}>
                          {story.timestamp}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="eye" size={12} color="rgba(255,255,255,0.6)" />
                          <Text style={{ color: 'white', fontSize: 12, opacity: 0.6, marginLeft: 4 }}>
                            {story.viewCount}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Story Viewer Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {/* Progress Bar */}
          <View style={{ 
            flexDirection: 'row', 
            paddingHorizontal: 16, 
            paddingTop: 48, 
            paddingBottom: 8 
          }}>
            <View style={{ 
              flex: 1, 
              height: 4, 
              backgroundColor: 'rgba(255,255,255,0.3)', 
              borderRadius: 2, 
              marginRight: 4 
            }}>
              <View
                style={{
                  height: 4,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  width: '30%'
                }}
              />
            </View>
          </View>

          {/* Story Content */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleCloseModal}
            style={{ flex: 1 }}
          >
            {selectedStory?.mediaUrl ? (
              <Image
                source={{ uri: selectedStory.mediaUrl }}
                style={{ flex: 1 }}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 32 }}>
                  {selectedStory?.content}
                </Text>
              </LinearGradient>
            )}

            {/* Story Info Overlay */}
            <View style={{ position: 'absolute', top: 60, left: 16, right: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#1f2937', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: 12 
                }}>
                  {selectedStory?.userAvatar ? (
                    <Image
                      source={{ uri: selectedStory.userAvatar }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={20} color="#9ca3af" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {selectedStory?.userName}
                  </Text>
                  <Text style={{ color: 'white', fontSize: 14, opacity: 0.8 }}>
                    {selectedStory?.timestamp}
                  </Text>
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{ 
                position: 'absolute', 
                top: 60, 
                right: 16, 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default SimpleStoriesSection;
