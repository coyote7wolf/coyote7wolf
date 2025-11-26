import React from "react";
import { theme } from "../../styles/theme";

export const Avatar = ({
  src,
  initials,
  size = theme.fontSize.xl,
  shape = "circle",
  borderColor = theme.colors.border,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: shape === "circle" ? "50%" : theme.borderRadius.md,
      border: `2px solid ${borderColor}`,
      background: src ? `url(${src}) center/cover` : theme.colors.background,
      color: theme.colors.text,
      fontWeight: theme.fontWeight.bold,
      fontSize: size * 0.5,
      overflow: "hidden",
    }}
    role="img"
    aria-label={initials || "avatar"}
  >
    {!src && initials}
  </span>
);

export default {
  title: "General/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Avatar 元件，支援圖片、字母、圓形/方形，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => <Avatar initials="A" />;

export const WithImage = () => (
  <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" />
);

export const WithInitials = () => (
  <Avatar
    initials="VL"
    size={theme.fontSize.xl}
    shape="circle"
    borderColor={theme.colors.primary}
  />
);

export const Square = () => <Avatar initials="S" shape="square" />;

export const Large = () => <Avatar initials="L" size={theme.fontSize.xxl} />;

export const Small = () => <Avatar initials="S" size={theme.fontSize.sm} />;

export const Group = () => (
  <div style={{ display: "flex", gap: theme.spacing.sm }}>
    <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" />
    <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" />
    <Avatar initials="VL" />
  </div>
);

export const Online = () => (
  <div style={{ position: "relative", display: "inline-block" }}>
    <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" />
    <span
      style={{
        position: "absolute",
        right: 2,
        bottom: 2,
        width: 10,
        height: 10,
        background: theme.colors.success,
        borderRadius: "50%",
        border: `2px solid ${theme.colors.background}`,
      }}
    />
  </div>
);

export const Offline = () => (
  <div style={{ position: "relative", display: "inline-block" }}>
    <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" />
    <span
      style={{
        position: "absolute",
        right: 2,
        bottom: 2,
        width: 10,
        height: 10,
        background: theme.colors.error,
        borderRadius: "50%",
        border: `2px solid ${theme.colors.background}`,
      }}
    />
  </div>
);

export const Error = () => (
  <Avatar src="invalid-url" initials="E" borderColor={theme.colors.error} />
);

export const CustomBorder = () => (
  <Avatar initials="C" borderColor={theme.colors.warning} />
);

export const Ghost = () => <Avatar initials="G" borderColor="transparent" />;
