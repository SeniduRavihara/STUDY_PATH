import { StyleSheet, Text, TextProps } from "react-native";

type AppTextProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "heading";
  bold?: boolean;
  color?: "primary" | "secondary" | "tertiary";
  center?: boolean;
} & TextProps;

export function AppText({
  children,
  size = "medium",
  bold = false,
  color = "primary",
  center = false,
  style,
  ...rest
}: AppTextProps) {
  const getTextStyle = () => {
    const baseStyle = [styles.text];

    // Size variant
    switch (size) {
      case "small":
        baseStyle.push(styles.small);
        break;
      case "medium":
        baseStyle.push(styles.medium);
        break;
      case "large":
        baseStyle.push(styles.large);
        break;
      case "heading":
        baseStyle.push(styles.heading);
        break;
    }

    // Bold variant
    if (bold) {
      baseStyle.push(styles.bold);
    }

    // Color variant
    switch (color) {
      case "primary":
        baseStyle.push(styles.colorPrimary);
        break;
      case "secondary":
        baseStyle.push(styles.colorSecondary);
        break;
      case "tertiary":
        baseStyle.push(styles.colorTertiary);
        break;
    }

    // Center variant
    if (center) {
      baseStyle.push(styles.center);
    }

    // Custom styles
    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  return (
    <Text style={getTextStyle()} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    // Base text styles
  },
  // Size variants
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
  // Bold variant
  bold: {
    fontWeight: "700",
  },
  // Color variants
  colorPrimary: {
    color: "#000000",
  },
  colorSecondary: {
    color: "#a0aec0",
  },
  colorTertiary: {
    color: "#cbd5e0",
  },
  // Center variant
  center: {
    textAlign: "center",
  },
});