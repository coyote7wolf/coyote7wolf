import React from "react";
import { theme } from "../../styles/theme";

// This file has been moved to Icon/Icon.stories.js
export const Icon = ({
  name = "star",
  color = theme.colors.primary,
  size = theme.fontSize.lg,
}) => (
  <span
    style={{
      display: "inline-block",
      color,
      fontSize: size,
      width: size,
      height: size,
      lineHeight: 1,
      textShadow: name === "circle" ? "0 0 2px #000" : undefined,
    }}
    role="img"
    aria-label={name}
  >
    {name === "star"
      ? "⭐"
      : name === "heart"
      ? "❤️"
      : name === "circle"
      ? "🔵"
      : "⬤"}
  </span>
);

export default {
  title: "General/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Icon 元件，支援多種顏色與尺寸，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => <Icon name="star" />;

export const Variants = () => (
  <>
    <Icon name="star" color={theme.colors.primary} />
    <Icon name="heart" color={theme.colors.error} />
    <Icon name="circle" color={theme.colors.success} />
  </>
);

export const Size = () => (
  <>
    <Icon name="star" size={theme.fontSize.sm} />
    <Icon name="star" size={theme.fontSize.md} />
    <Icon name="star" size={theme.fontSize.lg} />
    <Icon name="star" size={theme.fontSize.xl} />
  </>
);

export const Color = () => (
  <>
    <Icon name="star" color={theme.colors.primary} />
    <Icon name="star" color={theme.colors.secondary} />
    <Icon name="star" color={theme.colors.error} />
    <Icon name="star" color={theme.colors.success} />
    <Icon name="star" color={theme.colors.warning} />
  </>
);

export const Filled = () => (
  <Icon
    name="star"
    color={theme.colors.primary}
    style={{
      background: theme.colors.primary,
      color: "#fff",
      borderRadius: theme.borderRadius.md,
    }}
  />
);

export const Outline = () => (
  <Icon
    name="star"
    color={theme.colors.primary}
    style={{
      border: `2px solid ${theme.colors.primary}`,
      background: "transparent",
      borderRadius: theme.borderRadius.md,
    }}
  />
);

export const Disabled = () => (
  <Icon name="star" color={theme.colors.disabled} style={{ opacity: 0.5 }} />
);

export const Loading = () => (
  <Icon
    name="star"
    color={theme.colors.primary}
    style={{ animation: "spin 1s linear infinite" }}
  />
);

export const CustomIcon = () => (
  <Icon name="heart" color={theme.colors.error} />
);

export const Block = () => (
  <div style={{ width: "100%" }}>
    <Icon
      name="star"
      color={theme.colors.primary}
      style={{ display: "block", margin: "0 auto" }}
    />
  </div>
);

export const Link = () => (
  <a href="#" style={{ color: theme.colors.primary }}>
    <Icon name="star" color={theme.colors.primary} />
  </a>
);

export const Ghost = () => (
  <Icon
    name="star"
    color={theme.colors.primary}
    style={{
      background: "transparent",
      border: "none",
      color: theme.colors.primary,
    }}
  />
);
