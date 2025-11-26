import React, { useState } from "react";
import { theme } from "../../styles/theme";

export const Checkbox = ({ checked, disabled, onChange, label }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      style={{
        accentColor: checked ? theme.colors.primary : theme.colors.border,
        width: theme.fontSize.lg,
        height: theme.fontSize.lg,
        border: `2px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing.sm,
      }}
    />
    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
      {label}
    </span>
  </label>
);

export default {
  title: "Form/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Checkbox 元件，支援選取、未選取、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Checked = () => (
  <Checkbox checked label="已選取" onChange={() => {}} />
);

export const Unchecked = () => (
  <Checkbox checked={false} label="未選取" onChange={() => {}} />
);

export const Disabled = () => (
  <Checkbox checked label="禁用" disabled onChange={() => {}} />
);

export const Indeterminate = () => (
  <Checkbox
    checked={false}
    label="部分選取"
    indeterminate
    onChange={() => {}}
  />
);

export const Small = () => (
  <Checkbox
    checked
    label="小尺寸"
    onChange={() => {}}
    style={{ width: theme.fontSize.sm, height: theme.fontSize.sm }}
  />
);

export const Large = () => (
  <Checkbox
    checked
    label="大尺寸"
    onChange={() => {}}
    style={{ width: theme.fontSize.xl, height: theme.fontSize.xl }}
  />
);

export const CustomColor = () => (
  <Checkbox
    checked
    label="自訂顏色"
    onChange={() => {}}
    style={{ accentColor: theme.colors.success }}
  />
);

export const WithLabel = () => (
  <Checkbox checked label="有標籤" onChange={() => {}} />
);
