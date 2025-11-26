import React from "react";
import { View, Image, Text } from "react-native";
import { theme } from "../../styles/theme";

export const Avatar = ({
  src,
  initials,
  size = theme.fontSize.xl,
  shape = "circle",
  borderColor = theme.colors.border,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: shape === "circle" ? size / 2 : theme.borderRadius.md,
      borderWidth: 2,
      borderColor: borderColor,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}
  >
    {src ? (
      <Image
        source={{ uri: src }}
        style={{
          width: size,
          height: size,
          borderRadius: shape === "circle" ? size / 2 : theme.borderRadius.md,
        }}
      />
    ) : (
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: theme.fontWeight.bold,
          fontSize: size * 0.5,
        }}
      >
        {initials}
      </Text>
    )}
  </View>
);

export default {
  title: "General/Avatar",
  component: Avatar,
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
