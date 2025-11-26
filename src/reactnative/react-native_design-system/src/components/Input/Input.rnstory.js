import React from "react";
import { View, TextInput, Text } from "react-native";
import { theme } from "../../styles/theme";

export const Input = ({
  value,
  onChangeText,
  error,
  disabled,
  label,
  placeholder,
}) => (
  <View style={{ marginBottom: theme.spacing.md }}>
    {label && (
      <Text
        style={{
          marginBottom: theme.spacing.xs,
          color: theme.colors.text,
          fontSize: theme.fontSize.sm,
        }}
      >
        {label}
      </Text>
    )}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      placeholder={placeholder}
      style={{
        backgroundColor: disabled
          ? theme.colors.disabled
          : theme.color.background,
        color: theme.colors.text,
        borderColor: error ? theme.color.error : theme.color.border,
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        fontSize: theme.fontSize.md,
        padding: theme.spacing.sm,
      }}
    />
    {error && (
      <Text
        style={{
          color: theme.colors.error,
          fontSize: theme.fontSize.sm,
          marginTop: theme.spacing.xs,
        }}
      >
        {error}
      </Text>
    )}
  </View>
);

export default {
  title: "Form/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "通用 Input 元件，支援錯誤、禁用、標籤，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => <Input placeholder="請輸入內容" />;

export const Error = () => <Input error="輸入錯誤" placeholder="請輸入內容" />;

export const Disabled = () => <Input disabled placeholder="已禁用" />;

export const WithLabel = () => <Input label="姓名" placeholder="請輸入姓名" />;

export const Password = () => (
  <Input placeholder="請輸入密碼" label="密碼" secureTextEntry />
);

export const Number = () => (
  <Input placeholder="請輸入數字" keyboardType="numeric" label="數字" />
);

export const Search = () => <Input placeholder="搜尋..." label="搜尋" />;

export const HelperText = () => (
  <Input label="Email" placeholder="請輸入 Email" />
  // 可在 Input 元件下方加一個 Text 顯示 helper
);

export const Success = () => (
  <Input
    placeholder="成功狀態"
    label="成功"
    borderColor={theme.colors.success}
  />
);

export const Large = () => (
  <Input
    placeholder="大尺寸"
    label="大尺寸"
    fontSize={theme.fontSize.xl}
    padding={theme.spacing.lg}
  />
);

export const Small = () => (
  <Input
    placeholder="小尺寸"
    label="小尺寸"
    fontSize={theme.fontSize.sm}
    padding={theme.spacing.xs}
  />
);

export const Prefix = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text style={{ marginRight: theme.spacing.xs }}>$</Text>
    <Input placeholder="金額" label="金額" />
  </View>
);

export const Suffix = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Input placeholder="百分比" label="百分比" />
    <Text style={{ marginLeft: theme.spacing.xs }}>%</Text>
  </View>
);

export const ReadOnly = () => (
  <Input value="只讀內容" label="只讀" editable={false} />
);

export const Clearable = () => <Input placeholder="可清除" label="可清除" />;
