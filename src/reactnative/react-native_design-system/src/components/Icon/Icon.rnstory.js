import React from "react";
import { View } from "react-native";
import { theme } from "../../styles/theme";

// 假設有一個 Icon 元件，支援 name, color, size props
export const Icon = ({
  name = "star",
  color = theme.colors.primary,
  size = theme.fontSize.lg,
}) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
    }}
  >
    <Text style={{ color, fontSize: size }}>
      {name === "star" ? "⭐" : name === "heart" ? "❤️" : "⬤"}
    </Text>
  </View>
);

export default {
  title: "General/Icon",
  component: Icon,
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
  <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
    <Icon name="star" color={theme.colors.primary} />
    <Icon name="heart" color={theme.colors.error} />
    <Icon name="circle" color={theme.colors.success} />
  </View>
);

export const Size = () => (
  <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
    <Icon name="star" size={theme.fontSize.sm} />
    <Icon name="star" size={theme.fontSize.md} />
    <Icon name="star" size={theme.fontSize.lg} />
    <Icon name="star" size={theme.fontSize.xl} />
  </View>
);

export const Color = () => (
  <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
    <Icon name="star" color={theme.colors.primary} />
    <Icon name="star" color={theme.colors.secondary} />
    <Icon name="star" color={theme.colors.error} />
    <Icon name="star" color={theme.colors.success} />
    <Icon name="star" color={theme.colors.warning} />
  </View>
);
