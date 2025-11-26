import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { theme } from "../../styles/theme";

const Checkbox = ({ checked, disabled, onChange, label }) => (
  <Pressable
    onPress={() => !disabled && onChange && onChange(!checked)}
    disabled={disabled}
    style={{
      flexDirection: "row",
      alignItems: "center",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <View
      style={{
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: checked
          ? theme.colors.primary
          : theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: theme.spacing.sm,
      }}
    >
      {checked && (
        <View
          style={{
            width: 12,
            height: 12,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
          }}
        />
      )}
    </View>
    <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
      {label}
    </Text>
  </Pressable>
);

export default {
  title: "Form/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "RN Checkbox 元件，支援選取、未選取、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Checked = () => {
  const [checked, setChecked] = useState(true);
  return <Checkbox checked={checked} label="已選取" onChange={setChecked} />;
};

export const Unchecked = () => {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} label="未選取" onChange={setChecked} />;
};

export const Disabled = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox checked={checked} label="禁用" disabled onChange={setChecked} />
  );
};

export const Indeterminate = () => {
  // Indeterminate is visual only, not native in RN
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: theme.color.warning,
          justifyContent: "center",
          alignItems: "center",
          marginRight: theme.spacing.sm,
        }}
      >
        <View
          style={{
            width: 12,
            height: 4,
            backgroundColor: theme.color.text,
            borderRadius: 2,
          }}
        />
      </View>
      <Text style={{ color: theme.color.text, fontSize: theme.fontSize.md }}>
        部分選取
      </Text>
    </View>
  );
};

export const Small = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox
      checked={checked}
      label="小尺寸"
      onChange={setChecked}
      style={{ width: 16, height: 16 }}
    />
  );
};

export const Large = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox
      checked={checked}
      label="大尺寸"
      onChange={setChecked}
      style={{ width: 32, height: 32 }}
    />
  );
};

export const CustomColor = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox
      checked={checked}
      label="自訂顏色"
      onChange={setChecked}
      style={{
        borderColor: theme.colors.success,
        backgroundColor: checked ? theme.color.success : theme.color.background,
      }}
    />
  );
};

export const WithLabel = () => {
  const [checked, setChecked] = useState(true);
  return <Checkbox checked={checked} label="有標籤" onChange={setChecked} />;
};
