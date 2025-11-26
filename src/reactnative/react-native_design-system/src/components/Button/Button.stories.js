import React from "react";
import { Button } from "./Button.web";
import { theme } from "../../styles/theme";

export default {
  title: "General/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Button 元件，支援多種狀態與設計 token，詳見 theme.ts。",
      },
    },
  },
};

export function Default() {
  return (
    <Button
      title="Default Button"
      color={theme.color.primary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  );
}

export function Variants() {
  return (
    <>
      <Button
        title="Primary"
        color={theme.color.primary}
        size="md"
        style={{
          borderRadius: theme.borderRadius.md,
          fontWeight: theme.fontWeight.medium,
          marginBottom: theme.spacing.sm,
        }}
      />
      <Button
        title="Secondary"
        color={theme.color.secondary}
        size="md"
        style={{
          borderRadius: theme.borderRadius.md,
          fontWeight: theme.fontWeight.medium,
        }}
      />
      <Button
        title="Success"
        color={theme.color.success}
        size="md"
        style={{
          borderRadius: theme.borderRadius.md,
          fontWeight: theme.fontWeight.medium,
        }}
      />
      <Button
        title="Error"
        color={theme.color.error}
        size="md"
        style={{
          borderRadius: theme.borderRadius.md,
          fontWeight: theme.fontWeight.medium,
        }}
      />
    </>
  );
}

export function Disabled() {
  return (
    <Button
      title="Disabled Button"
      color={theme.color.disabled}
      size="md"
      disabled
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  );
}

export function Loading() {
  return (
    <Button
      title="Loading..."
      color={theme.color.primary}
      size="md"
      loading
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  );
}

export function Outline() {
  return (
    <Button
      title="Outline Button"
      color={theme.color.primary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
        background: "transparent",
        border: `2px solid ${theme.color.primary}`,
        color: theme.color.primary,
      }}
    />
  );
}

export function Text() {
  return (
    <Button
      title="Text Button"
      color="transparent"
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
        background: "transparent",
        color: theme.color.primary,
        border: "none",
      }}
    />
  );
}

export function Icon() {
  return (
    <Button
      title={
        <span role="img" aria-label="star">
          ⭐
        </span>
      }
      color={theme.color.primary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
      }}
    />
  );
}

export function Sizes() {
  return (
    <>
      <Button
        title="Small"
        color={theme.color.primary}
        size="sm"
        style={{
          borderRadius: theme.borderRadius.sm,
          fontWeight: theme.fontWeight.medium,
          fontSize: theme.fontSize.sm,
        }}
      />
      <Button
        title="Medium"
        color={theme.color.primary}
        size="md"
        style={{
          borderRadius: theme.borderRadius.md,
          fontWeight: theme.fontWeight.medium,
          fontSize: theme.fontSize.md,
        }}
      />
      <Button
        title="Large"
        color={theme.color.primary}
        size="lg"
        style={{
          borderRadius: theme.borderRadius.lg,
          fontWeight: theme.fontWeight.medium,
          fontSize: theme.fontSize.lg,
        }}
      />
    </>
  );
}

export function Block() {
  return (
    <Button
      title="Block Button"
      color={theme.color.primary}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
        width: "100%",
        display: "block",
      }}
    />
  );
}

export function Danger() {
  return (
    <Button
      title="Danger Button"
      color={theme.color.error}
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
        background: theme.color.error,
        color: "#fff",
      }}
    />
  );
}

export function Link() {
  return (
    <Button
      title="Link Button"
      color="transparent"
      size="md"
      style={{
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.fontWeight.medium,
        background: "transparent",
        color: theme.color.primary,
        textDecoration: "underline",
        border: "none",
      }}
    />
  );
}
