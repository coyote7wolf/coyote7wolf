import React, { useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { theme } from "../../styles/theme";

const Select = ({ options = [], value, onChange, disabled, placeholder }) => {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Pressable
        onPress={() => !disabled && setVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.background,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
          {value
            ? options.find((opt) => opt.value === value)?.label
            : placeholder || "請選擇"}
        </Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)}>
          <View
            style={{
              margin: 40,
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange && onChange(item.value);
                    setVisible(false);
                  }}
                  style={{ padding: theme.spacing.sm }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: theme.fontSize.md,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default {
  title: "Form/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component: "RN Select 元件，支援選項、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => <Select placeholder="請選擇" />;

export const WithOptions = () => {
  const [value, setValue] = useState("");
  return (
    <Select
      options={[
        { value: "A", label: "選項A" },
        { value: "B", label: "選項B" },
        { value: "C", label: "選項C" },
      ]}
      value={value}
      onChange={setValue}
      placeholder="請選擇"
    />
  );
};

export const Disabled = () => (
  <Select
    options={[
      { value: "A", label: "選項A" },
      { value: "B", label: "選項B" },
      { value: "C", label: "選項C" },
    ]}
    value={"A"}
    disabled
    placeholder="請選擇"
  />
);

export const Large = () => {
  const [value, setValue] = useState("");
  return (
    <Select
      options={[
        { value: "A", label: "選項A" },
        { value: "B", label: "選項B" },
      ]}
      value={value}
      onChange={setValue}
      placeholder="請選擇"
      style={{ fontSize: theme.fontSize.lg, padding: theme.spacing.lg }}
    />
  );
};

export const Small = () => {
  const [value, setValue] = useState("");
  return (
    <Select
      options={[
        { value: "A", label: "選項A" },
        { value: "B", label: "選項B" },
      ]}
      value={value}
      onChange={setValue}
      placeholder="請選擇"
      style={{ fontSize: theme.fontSize.sm, padding: theme.spacing.xs }}
    />
  );
};

export const Error = () => {
  const [value, setValue] = useState("");
  return (
    <View>
      <Select
        options={[
          { value: "A", label: "選項A" },
          { value: "B", label: "選項B" },
        ]}
        value={value}
        onChange={setValue}
        placeholder="請選擇"
        style={{ borderColor: theme.colors.error }}
      />
      <Text
        style={{
          color: theme.colors.error,
          fontSize: theme.fontSize.sm,
          marginTop: theme.spacing.xs,
        }}
      >
        選擇錯誤
      </Text>
    </View>
  );
};

export const Success = () => {
  const [value, setValue] = useState("");
  return (
    <View>
      <Select
        options={[
          { value: "A", label: "選項A" },
          { value: "B", label: "選項B" },
        ]}
        value={value}
        onChange={setValue}
        placeholder="請選擇"
        style={{ borderColor: theme.colors.success }}
      />
      <Text
        style={{
          color: theme.colors.success,
          fontSize: theme.fontSize.sm,
          marginTop: theme.spacing.xs,
        }}
      >
        選擇成功
      </Text>
    </View>
  );
};

export const CustomColor = () => {
  const [value, setValue] = useState("");
  return (
    <Select
      options={[
        { value: "A", label: "選項A" },
        { value: "B", label: "選項B" },
      ]}
      value={value}
      onChange={setValue}
      placeholder="請選擇"
      style={{ borderColor: theme.colors.info, color: theme.colors.info }}
    />
  );
};

export const WithLabel = () => {
  const [value, setValue] = useState("");
  return (
    <View>
      <Text
        style={{
          marginBottom: theme.spacing.xs,
          color: theme.colors.text,
          fontSize: theme.fontSize.sm,
        }}
      >
        標籤
      </Text>
      <Select
        options={[
          { value: "A", label: "選項A" },
          { value: "B", label: "選項B" },
        ]}
        value={value}
        onChange={setValue}
        placeholder="請選擇"
      />
    </View>
  );
};

export const Group = () => {
  const [value, setValue] = useState("");
  return (
    <View>
      <Text
        style={{
          marginBottom: theme.spacing.xs,
          color: theme.colors.text,
          fontSize: theme.fontSize.sm,
        }}
      >
        群組選擇
      </Text>
      <Select
        options={[
          { value: "A", label: "群組A" },
          { value: "B", label: "群組B" },
          { value: "C", label: "群組C" },
        ]}
        value={value}
        onChange={setValue}
        placeholder="請選擇"
      />
    </View>
  );
};
