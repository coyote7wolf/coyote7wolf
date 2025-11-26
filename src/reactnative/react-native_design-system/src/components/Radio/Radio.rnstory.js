import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { theme } from "../../styles/theme";

const Radio = ({ selected, disabled, onChange, label }) => (
  <Pressable
    onPress={() => !disabled && onChange && onChange(!selected)}
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
        borderRadius: 12,
        backgroundColor: selected
          ? theme.colors.primary
          : theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: theme.spacing.sm,
      }}
    >
      {selected && (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: theme.colors.primary,
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
  title: "Form/Radio",
  component: Radio,
  parameters: {
    docs: {
      description: {
        component:
          "RN Radio 元件，支援選取、未選取、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Selected = () => {
  const [selected, setSelected] = useState(true);
  return <Radio selected={selected} label="已選取" onChange={setSelected} />;
};

export const Unselected = () => {
  const [selected, setSelected] = useState(false);
  return <Radio selected={selected} label="未選取" onChange={setSelected} />;
};

export const Disabled = () => {
  const [selected, setSelected] = useState(true);
  return (
    <Radio selected={selected} label="禁用" disabled onChange={setSelected} />
  );
};

export const Group = () => {
  const [value, setValue] = useState("A");
  return (
    <View>
      <Radio
        selected={value === "A"}
        label="選項A"
        onChange={() => setValue("A")}
      />
      <Radio
        selected={value === "B"}
        label="選項B"
        onChange={() => setValue("B")}
      />
      <Radio
        selected={value === "C"}
        label="選項C"
        onChange={() => setValue("C")}
      />
    </View>
  );
};

export const Small = () => {
  const [selected, setSelected] = useState(true);
  return (
    <Radio
      selected={selected}
      label="小尺寸"
      onChange={setSelected}
      style={{ width: 16, height: 16 }}
    />
  );
};

export const Large = () => {
  const [selected, setSelected] = useState(true);
  return (
    <Radio
      selected={selected}
      label="大尺寸"
      onChange={setSelected}
      style={{ width: 32, height: 32 }}
    />
  );
};

export const CustomColor = () => {
  const [selected, setSelected] = useState(true);
  return (
    <Radio
      selected={selected}
      label="自訂顏色"
      onChange={setSelected}
      style={{
        borderColor: theme.colors.success,
        backgroundColor: selected
          ? theme.colors.success
          : theme.colors.background,
      }}
    />
  );
};

export const WithLabel = () => {
  const [selected, setSelected] = useState(true);
  return <Radio selected={selected} label="有標籤" onChange={setSelected} />;
};
