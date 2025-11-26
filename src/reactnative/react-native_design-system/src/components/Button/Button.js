import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../styles/designSystem";

export const Button = ({ title }) => (
  <View style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: typography.button,
    fontWeight: "bold",
  },
});
