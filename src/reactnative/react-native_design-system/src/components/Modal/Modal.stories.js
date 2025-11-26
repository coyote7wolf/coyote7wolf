import React from "react";
import { theme } from "../../styles/theme";
import { Modal } from "./Modal";

const meta = {
  title: "Layout/Modal",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "通用 Modal 元件，支援開啟、關閉、動作，設計 token 來自 theme.ts。",
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Modal 是否開啟",
      defaultValue: false,
    },
    token: {
      control: "object",
      description: "設計 token (背景、圓角、陰影、padding)",
      defaultValue: {
        backgroundColor: "#F4F6FB",
        borderRadius: 16,
        shadow: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        },
        padding: 24,
      },
    },
    actions: {
      control: false,
      description: "Modal 底部動作按鈕 (ReactNode[])",
    },
    style: {
      control: "object",
      description: "自訂 Modal 樣式",
    },
    children: {
      control: "text",
      description: "Modal 內容 (ReactNode)",
      defaultValue: "這是 Modal 內容",
    },
    onClose: {
      action: "onClose",
      description: "關閉 Modal 的 callback (Storybook Actions)",
    },
  },
};

export default meta;

export const Default = {
  args: {
    open: true,
    token: {
      backgroundColor: theme.modal.backgroundColor,
      borderRadius: theme.modal.borderRadius,
      shadow: theme.modal.shadow,
      padding: theme.modal.padding,
    },
    children: "這是 Modal 內容",
    actions: undefined,
    style: {},
    onClose: () => {},
  },
  render: (args) => <Modal {...args} />,
};

export const Open = {
  args: {
    open: true,
    token: {
      backgroundColor: theme.modal.backgroundColor,
      borderRadius: theme.modal.borderRadius,
      shadow: theme.modal.shadow,
      padding: theme.modal.padding,
    },
    children: "這是已開啟的 Modal",
    actions: undefined,
    style: {},
    onClose: () => {},
  },
  render: (args) => <Modal {...args} />,
};

export const Close = {
  args: {
    open: false,
    token: {
      backgroundColor: theme.modal.backgroundColor,
      borderRadius: theme.modal.borderRadius,
      shadow: theme.modal.shadow,
      padding: theme.modal.padding,
    },
    children: "這是已關閉的 Modal",
    actions: undefined,
    style: {},
    onClose: () => {},
  },
  render: (args) => <Modal {...args} />,
};

export const WithActions = {
  args: {
    open: true,
    token: {
      backgroundColor: theme.modal.backgroundColor,
      borderRadius: theme.modal.borderRadius,
      shadow: theme.modal.shadow,
      padding: theme.modal.padding,
    },
    children: "這是有動作的 Modal",
    actions: [
      <button
        key="ok"
        style={{
          color: theme.colors.text,
          background: theme.colors.primary,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.fontSize.md,
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => {}}
      >
        確定
      </button>,
      <button
        key="cancel"
        style={{
          color: theme.colors.text,
          background: theme.colors.secondary,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.fontSize.md,
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => {}}
      >
        取消
      </button>,
    ],
    style: {},
    onClose: () => {},
  },
  render: (args) => <Modal {...args} />,
};

export const Test = {
  args: {
    open: true,
    token: {
      backgroundColor: "#F4F6FB",
      borderRadius: 16,

      shadow: {
        shadowColor: "#000",

        shadowOffset: {
          width: 0,
          height: 4,
        },

        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },

      padding: 24,
    },
    children: "這是有動作的 Modal",
    actions: [
      {
        type: "button",
        key: "ok",

        props: {
          style: {
            color: "#222222",
            background: "#007AFF",
            borderRadius: 8,
            fontSize: 16,
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
          },

          children: "確定",
        },

        _owner: null,
        _store: {},
      },
      {
        type: "button",
        key: "cancel",

        props: {
          style: {
            color: "#222222",
            background: "#5856D6",
            borderRadius: 8,
            fontSize: 16,
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
          },

          children: "取消",
        },

        _owner: null,
        _store: {},
      },
    ],
    style: {},
  },
  render: (args) => <Modal {...args} />,
};
