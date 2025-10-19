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
  return (
  <Pressable
  ref={ref}
onPress={onPress}
style={[
  styles.base,
styles[theme],
disabled && styles.disabled,
]}
disabled={disabled}
{...rest}
>
<Text
  style={[
      styles.textBase,
    styles[`${theme}Text`],
]}
>
{title}
</Text>
</Pressable>
);
});

Button.displayName = "Button";

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  secondary: {
    backgroundColor: "white",
    borderColor: "#d1d5db",
  },
  tertiary: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 1,
  },
  primaryText: {
    color: "white",
  },
  secondaryText: {
    color: "black",
  },
  tertiaryText: {
    color: "#374151",
  },
});
