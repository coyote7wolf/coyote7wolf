import React, { useState } from "react";
import { theme } from "../../styles/theme";

export const Select = ({
  options = [],
  value,
  onChange,
  disabled,
  placeholder,
}) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{
      color: theme.colors.text,
      background: theme.colors.background,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.fontSize.md,
      padding: theme.spacing.sm,
      width: "100%",
      boxSizing: "border-box",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export default {
  title: "Form/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Select 元件，支援選項、禁用，設計 token 來自 theme.ts。",
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
      onChange={(e) => setValue(e.target.value)}
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
