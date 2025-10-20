import React from "react";
import {
  Pressable,
  PressableProps,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

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
    let style = { ...styles.button };

    switch (theme) {
      case "primary":
        style = { ...style, ...styles.primaryButton };
        break;
      case "secondary":
        style = { ...style, ...styles.secondaryButton };
        break;
      case "tertiary":
        style = { ...style, ...styles.tertiaryButton };
        break;
    }

    if (disabled) {
      style = { ...style, ...styles.disabled };
    }

    return style;
  };

  const getTextStyle = (): TextStyle => {
    let style: TextStyle = { ...styles.text };

    switch (theme) {
      case "primary":
        style = { ...style, ...styles.primaryText };
        break;
      case "secondary":
        style = { ...style, ...styles.secondaryText };
        break;
      case "tertiary":
        style = { ...style, ...styles.tertiaryText };
        break;
    }

    return style;
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

const styles = {
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  } as ViewStyle,
  primaryButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  } as Partial<ViewStyle>,
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
  } as Partial<ViewStyle>,
  tertiaryButton: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  } as Partial<ViewStyle>,
  disabled: {
    opacity: 0.5,
  } as Partial<ViewStyle>,
  text: {
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  } as TextStyle,
  primaryText: {
    color: "#ffffff",
  } as Partial<TextStyle>,
  secondaryText: {
    color: "#000000",
  } as Partial<TextStyle>,
  tertiaryText: {
    color: "#4b5563",
  } as Partial<TextStyle>,
};
