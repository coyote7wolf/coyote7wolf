import React, { useState } from "react";
import { theme } from "../../styles/theme";

export const Switch = ({ checked, disabled, onChange }) => (
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
        width: 40,
        height: 24,
        appearance: "none",
        backgroundColor: checked ? theme.colors.primary : theme.colors.border,
        borderRadius: 12,
        position: "relative",
        transition: "background 0.2s",
        marginRight: theme.spacing.sm,
      }}
    />
    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
      {checked ? "開啟" : "關閉"}
    </span>
  </label>
);

export default {
  title: "Form/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Switch 元件，支援開啟、關閉、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const On = () => {
  const [checked, setChecked] = useState(true);
  return <Switch checked={checked} onChange={() => setChecked(!checked)} />;
};

export const Off = () => {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} onChange={() => setChecked(!checked)} />;
};

export const Disabled = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch checked={checked} disabled onChange={() => setChecked(!checked)} />
  );
};

export const Small = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={() => setChecked(!checked)}
      style={{ width: 32, height: 16 }}
    />
  );
};

export const Large = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={() => setChecked(!checked)}
      style={{ width: 56, height: 32 }}
    />
  );
};

export const CustomColor = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={() => setChecked(!checked)}
      style={{
        backgroundColor: checked ? theme.colors.success : theme.colors.border,
      }}
    />
  );
};

export const WithLabel = () => {
  const [checked, setChecked] = useState(true);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Switch checked={checked} onChange={() => setChecked(!checked)} />
      <span style={{ marginLeft: theme.spacing.sm, color: theme.colors.text }}>
        有標籤
      </span>
    </div>
  );
};
