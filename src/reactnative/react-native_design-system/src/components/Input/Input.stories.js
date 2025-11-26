import React from "react";
import { theme } from "../../styles/theme";

export const Input = ({
  value,
  onChange,
  error,
  disabled,
  label,
  placeholder,
}) => (
  <div style={{ marginBottom: theme.spacing.md }}>
    {label && (
      <label
        style={{
          marginBottom: theme.spacing.xs,
          color: theme.colors.text,
          fontSize: theme.fontSize.sm,
          display: "block",
        }}
      >
        {label}
      </label>
    )}
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      style={{
        background: disabled ? theme.colors.disabled : theme.colors.background,
        color: theme.colors.text,
        border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        fontSize: theme.fontSize.md,
        padding: theme.spacing.sm,
        width: "100%",
        boxSizing: "border-box",
      }}
    />
    {error && (
      <div
        style={{
          color: theme.colors.error,
          fontSize: theme.fontSize.sm,
          marginTop: theme.spacing.xs,
        }}
      >
        {error}
      </div>
    )}
  </div>
);

export default {
  title: "Form/Input",
  component: Input,
  tags: ["autodocs"],
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
  <Input label="密碼" placeholder="請輸入密碼" type="password" />
);

export const Number = () => (
  <Input label="年齡" placeholder="請輸入年齡" type="number" />
);

export const Search = () => (
  <Input label="搜尋" placeholder="請輸入關鍵字" type="search" />
);

export const HelperText = () => (
  <Input
    label="Email"
    placeholder="請輸入 Email"
    error={false}
    helperText="請輸入有效的 Email 地址"
  />
);

export const Success = () => (
  <Input
    label="驗證碼"
    placeholder="已驗證"
    error={false}
    helperText="驗證成功"
  />
);

export const Large = () => (
  <Input
    label="大尺寸"
    placeholder="Large Input"
    style={{ fontSize: theme.fontSize.lg, padding: theme.spacing.lg }}
  />
);

export const Small = () => (
  <Input
    label="小尺寸"
    placeholder="Small Input"
    style={{ fontSize: theme.fontSize.sm, padding: theme.spacing.xs }}
  />
);

export const Prefix = () => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <span style={{ marginRight: theme.spacing.xs, color: theme.colors.text }}>
      +886
    </span>
    <Input label="手機" placeholder="請輸入手機號碼" />
  </div>
);

export const Suffix = () => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <Input label="金額" placeholder="請輸入金額" />
    <span style={{ marginLeft: theme.spacing.xs, color: theme.colors.text }}>
      NTD
    </span>
  </div>
);

export const ReadOnly = () => <Input label="唯讀" value="僅供查看" readOnly />;

export const Clearable = () => {
  const [value, setValue] = React.useState("");
  return (
    <div style={{ position: "relative" }}>
      <Input
        label="可清除"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="請輸入內容"
      />
      {value && (
        <button
          style={{
            position: "absolute",
            right: theme.spacing.sm,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: theme.colors.text,
            cursor: "pointer",
          }}
          onClick={() => setValue("")}
        >
          清除
        </button>
      )}
    </div>
  );
};
