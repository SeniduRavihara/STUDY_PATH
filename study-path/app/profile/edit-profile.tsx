import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("Passionate learner and knowledge seeker");
  const [location, setLocation] = useState("New York, USA");
  const [website, setWebsite] = useState("");

  const handleSave = () => {
    Alert.alert("Success", "Profile updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Picture Section */}
      <View style={styles.profilePictureSection}>
        <View style={styles.profilePictureContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            }}
            style={styles.profilePicture}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* Website */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Website</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="Enter your website URL"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveChangesButton}
          onPress={handleSave}
        >
          <Text style={styles.saveChangesText}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  saveButton: {
    color: "#60a5fa",
    fontWeight: "600",
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  profilePictureContainer: {
    position: "relative",
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  cameraButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 9999,
  },
  changePhotoButton: {
    marginTop: 16,
  },
  changePhotoText: {
    color: "#60a5fa",
    fontWeight: "600",
  },
  formSection: {
    paddingHorizontal: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 16,
    borderRadius: 16,
  },
  bioInput: {
    height: 96,
  },
  saveChangesButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  saveChangesText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
});