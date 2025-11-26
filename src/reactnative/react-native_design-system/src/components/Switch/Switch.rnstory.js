import React, { useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { theme } from "../../styles/theme";

const Switch = ({ checked, disabled, onChange }) => (
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
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: checked ? theme.colors.primary : theme.colors.border,
        justifyContent: "center",
        padding: 2,
        marginRight: theme.spacing.sm,
      }}
    >
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: checked
            ? theme.colors.thumbOn
            : theme.colors.thumbOff,
          transform: [{ translateX: checked ? 16 : 0 }],
        }}
      />
    </View>
    <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
      {checked ? "開啟" : "關閉"}
    </Text>
  </Pressable>
);

export default {
  title: "Form/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "RN Switch 元件，支援開啟、關閉、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const On = () => {
  const [checked, setChecked] = useState(true);
  return <Switch checked={checked} onChange={setChecked} />;
};

export const Off = () => {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} onChange={setChecked} />;
};

export const Disabled = () => {
  const [checked, setChecked] = useState(true);
  return <Switch checked={checked} disabled onChange={setChecked} />;
};

export const Small = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      style={{ width: 32, height: 16 }}
    />
  );
};

export const Large = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      style={{ width: 56, height: 32 }}
    />
  );
};

export const CustomColor = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      style={{
        backgroundColor: checked ? theme.colors.success : theme.colors.border,
      }}
    />
  );
};

export const WithLabel = () => {
  const [checked, setChecked] = useState(true);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Switch checked={checked} onChange={setChecked} />
      <Text style={{ marginLeft: theme.spacing.sm, color: theme.colors.text }}>
        有標籤
      </Text>
    </View>
  );
};
