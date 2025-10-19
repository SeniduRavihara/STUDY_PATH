import { StyleSheet, Text } from "react-native";

type AppTextProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "heading";
  bold?: boolean;
  color?: "primary" | "secondary" | "tertiary";
  center?: boolean;
  style?: any;
};

export function AppText({
  children,
  size = "medium",
  bold = false,
  color = "primary",
  center = false,
  style,
}: AppTextProps) {
  return (
    <Text
      style={[
        styles[size],
        bold && styles.bold,
        styles[color],
        center && styles.center,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    marginBottom: 8,
  },
  medium: {
    fontSize: 16,
    marginBottom: 12,
  },
  large: {
    fontSize: 18,
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  primary: {
    color: "black",
  },
  secondary: {
    color: "#6b7280",
  },
  tertiary: {
    color: "#9ca3af",
  },
  center: {
    textAlign: "center",
  },
});
