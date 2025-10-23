import React from "react";
import { StyleSheet, View } from "react-native";

interface StudyWrapperProps {
  children: React.ReactNode;
}

export default function StudyWrapper({ children }: StudyWrapperProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
