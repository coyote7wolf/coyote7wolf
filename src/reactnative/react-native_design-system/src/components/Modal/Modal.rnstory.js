import React, { useState } from "react";
import { View, Text, Pressable, Modal as RNModal } from "react-native";
import { theme } from "../../styles/theme";

const Modal = ({ open, onClose, children, actions, style }) => (
  <RNModal
    visible={open}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={onClose}
    >
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
          padding: theme.spacing.lg,
          minWidth: 320,
          ...style,
        }}
      >
        <View>{children}</View>
        {actions && (
          <View
            style={{
              marginTop: theme.spacing.md,
              flexDirection: "row",
              gap: theme.spacing.sm,
            }}
          >
            {actions}
          </View>
        )}
        <Pressable style={{ marginTop: theme.spacing.md }} onPress={onClose}>
          <Text>關閉</Text>
        </Pressable>
      </View>
    </Pressable>
  </RNModal>
);

export default {
  title: "Layout/Modal",
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          "RN Modal 元件，支援開啟、關閉、動作，設計 token 來自 theme.ts。",
      },
    },
  },
};

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <Text>開啟 Modal</Text>
      </Pressable>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Text>這是 Modal 內容</Text>
      </Modal>
    </>
  );
};

export const Open = () => (
  <Modal open onClose={() => {}}>
    <Text>這是已開啟的 Modal</Text>
  </Modal>
);

export const Close = () => (
  <Modal open={false} onClose={() => {}}>
    <Text>這是已關閉的 Modal</Text>
  </Modal>
);

export const WithActions = () => {
  const [open, setOpen] = useState(true);
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      actions={[
        <Pressable key="ok" onPress={() => setOpen(false)}>
          <Text>確定</Text>
        </Pressable>,
        <Pressable key="cancel" onPress={() => setOpen(false)}>
          <Text>取消</Text>
        </Pressable>,
      ]}
    >
      <Text>這是有動作的 Modal</Text>
    </Modal>
  );
};
