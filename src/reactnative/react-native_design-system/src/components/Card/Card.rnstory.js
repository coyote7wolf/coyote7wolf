import React from "react";
import { View, Text } from "react-native";
import { theme } from "../../styles/theme";

const Card = ({ children, header, footer, style }) => (
  <View
    style={{
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      padding: theme.spacing.md,
      ...style,
    }}
  >
    {header && (
      <Text
        style={{
          marginBottom: theme.spacing.sm,
          fontWeight: "bold",
          fontSize: theme.fontSize.lg,
        }}
      >
        {header}
      </Text>
    )}
    <View>{children}</View>
    {footer && (
      <Text
        style={{
          marginTop: theme.spacing.sm,
          color: theme.colors.textSecondary,
        }}
      >
        {footer}
      </Text>
    )}
  </View>
);

export default {
  title: "Layout/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "RN Card 元件，支援 Header、Footer，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => <Card>這是卡片內容</Card>;

export const WithHeader = () => <Card header="卡片標題">這是卡片內容</Card>;

export const WithFooter = () => <Card footer="卡片頁腳">這是卡片內容</Card>;
