import React from "react";
import { theme } from "../../styles/theme";

export const Radio = ({ selected, disabled, onChange, label }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <input
      type="radio"
      checked={selected}
      disabled={disabled}
      onChange={onChange}
      style={{
        width: theme.fontSize.lg,
        height: theme.fontSize.lg,
        border: `2px solid ${theme.colors.border}`,
        borderRadius: "50%",
        accentColor: selected ? theme.colors.primary : theme.colors.border,
        marginRight: theme.spacing.sm,
      }}
    />
    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
      {label}
    </span>
  </label>
);

export default {
  title: "Form/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Radio 元件，支援選取、未選取、禁用，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Selected = () => (
  <Radio selected label="已選取" onChange={() => {}} />
);

export const Unselected = () => (
  <Radio selected={false} label="未選取" onChange={() => {}} />
);

export const Disabled = () => (
  <Radio selected label="禁用" disabled onChange={() => {}} />
);

export const Group = () => {
  const [value, setValue] = React.useState("A");
  return (
    <div>
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
    </div>
  );
};

export const Small = () => (
  <Radio
    selected
    label="小尺寸"
    onChange={() => {}}
    style={{ width: theme.fontSize.sm, height: theme.fontSize.sm }}
  />
);

export const Large = () => (
  <Radio
    selected
    label="大尺寸"
    onChange={() => {}}
    style={{ width: theme.fontSize.xl, height: theme.fontSize.xl }}
  />
);

export const CustomColor = () => (
  <Radio
    selected
    label="自訂顏色"
    onChange={() => {}}
    style={{ accentColor: theme.colors.success }}
  />
);

export const WithLabel = () => (
  <Radio selected label="有標籤" onChange={() => {}} />
);
