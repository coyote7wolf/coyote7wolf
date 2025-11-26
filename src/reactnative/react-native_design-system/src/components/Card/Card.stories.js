import React from "react";
import { theme } from "../../styles/theme";

export const Card = ({ children, header, footer, style }) => (
  <div
    style={{
      background: theme.colors.surface || theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadow.md,
      padding: theme.spacing.md,
      ...style,
    }}
  >
    {header && (
      <div
        style={{
          marginBottom: theme.spacing.sm,
          fontWeight: theme.fontWeight.bold,
        }}
      >
        {header}
      </div>
    )}
    <div>{children}</div>
    {footer && (
      <div
        style={{
          marginTop: theme.spacing.sm,
          color: theme.colors.textSecondary,
        }}
      >
        {footer}
      </div>
    )}
  </div>
);

export default {
  title: "Layout/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Card 元件，支援 Header、Footer，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => <Card>這是卡片內容</Card>;

export const WithHeader = () => <Card header="卡片標題">這是卡片內容</Card>;

export const WithFooter = () => <Card footer="卡片頁腳">這是卡片內容</Card>;

export const WithHeaderFooter = () => (
  <Card header="卡片標題" footer="卡片頁腳">
    這是卡片內容
  </Card>
);

export const CustomColor = () => (
  <Card style={{ background: theme.colors.info }}>自訂顏色卡片</Card>
);

export const ShadowNone = () => (
  <Card style={{ boxShadow: "none" }}>無陰影卡片</Card>
);

export const Large = () => (
  <Card
    style={{ padding: theme.spacing.xl, borderRadius: theme.borderRadius.xl }}
  >
    大尺寸卡片
  </Card>
);

export const Small = () => (
  <Card
    style={{ padding: theme.spacing.xs, borderRadius: theme.borderRadius.sm }}
  >
    小尺寸卡片
  </Card>
);

export const Grouped = () => (
  <div style={{ display: "flex", gap: theme.spacing.md }}>
    <Card header="A">內容A</Card>
    <Card header="B">內容B</Card>
    <Card header="C">內容C</Card>
  </div>
);
