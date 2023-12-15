import React, { ReactNode } from "react";
import {
  Falsy,
  RecursiveArray,
  RegisteredStyle,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Button as PaperButton } from "react-native-paper";
import { theme } from "../core/theme";

type ButtonProps = {
  mode?: any;
  backgroundColor?: any;
  textColor?: any;
  children: ReactNode;
  onPress?: () => void;
};

export default function Button({
  mode = "outlined",
  children,
  textColor = "white",
  backgroundColor = theme.colors.primary,
  onPress,
}: ButtonProps) {
  return (
    <PaperButton
      style={{
        ...styles.button,
        backgroundColor: backgroundColor,
      }}
      onPress={onPress}
      labelStyle={{ ...styles.text, color: textColor }}
      mode={mode}>
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    marginVertical: 10,
    paddingVertical: 2,
  },
  text: {
    fontWeight: "bold",
    fontSize: 15,
    lineHeight: 26,
  },
});
