import { Pressable, PressableProps, StyleSheet, Text } from "react-native";
import React from "react";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  theme?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
} & PressableProps;

export const Button = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  ButtonProps
>(({ title, onPress, theme = "primary", disabled, ...rest }, ref) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    switch (theme) {
      case "primary":
        baseStyle.push(styles.primaryButton);
        break;
      case "secondary":
        baseStyle.push(styles.secondaryButton);
        break;
      case "tertiary":
        baseStyle.push(styles.tertiaryButton);
        break;
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];

    switch (theme) {
      case "primary":
        baseStyle.push(styles.primaryText);
        break;
      case "secondary":
        baseStyle.push(styles.secondaryText);
        break;
      case "tertiary":
        baseStyle.push(styles.tertiaryText);
        break;
    }

    return baseStyle;
  };

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      style={getButtonStyle()}
      disabled={disabled}
      {...rest}
    >
      <Text style={getTextStyle()}>
        {title} {disabled}
      </Text>
    </Pressable>
  );
});

Button.displayName = "Button";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
  },
  tertiaryButton: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#000000",
  },
  tertiaryText: {
    color: "#4b5563",
  },
});