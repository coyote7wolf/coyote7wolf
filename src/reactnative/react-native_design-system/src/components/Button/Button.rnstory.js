import React from "react";
import { View } from "react-native";
import { Button } from "./Button";
import { theme } from "../../styles/theme";

export default {
  title: "General/Button",
  component: Button,
};

export const Default = () => (
  <View style={{ padding: theme.spacing.md }}>
    <Button
      title="Default Button"
      color={theme.colors.primary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  </View>
);

export const Variants = () => (
  <View style={{ gap: theme.spacing.sm }}>
    <Button
      title="Primary"
      color={theme.color.primary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
    <Button
      title="Secondary"
      color={theme.colors.secondary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
    <Button
      title="Success"
      color={theme.colors.success}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
    <Button
      title="Error"
      color={theme.colors.error}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  </View>
);

export const Disabled = () => (
  <View style={{ padding: theme.spacing.md }}>
    <Button
      title="Disabled Button"
      color={theme.colors.disabled}
      size="md"
      disabled
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  </View>
);

export const Loading = () => (
  <View style={{ padding: theme.spacing.md }}>
    <Button
      title="Loading..."
      color={theme.colors.primary}
      size="md"
      loading
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  </View>
);
