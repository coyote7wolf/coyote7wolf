import React from "react";
import { theme } from "../../styles/theme";

export function Modal({ open, onClose, children, actions, style, token }) {
  const modalStyle = {
    background: token?.backgroundColor || theme.colors.surface,
    color: theme.colors.text,
    borderRadius: token?.borderRadius || theme.borderRadius.lg,
    boxShadow: token?.shadow || theme.shadow.lg,
    padding: token?.padding || theme.spacing.lg,
    minWidth: 320,
    minHeight: 120,
    maxWidth: 480,
    border: `1px solid ${theme.colors.border}`,
    zIndex: 1001,
    textAlign: "center",
    overflow: "auto",
    ...style,
  };
  if (token?.backgroundColor) {
    modalStyle.background = token.backgroundColor;
    delete modalStyle.backgroundColor;
  }
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: open ? "#c0c0c0" : "#ffcccc",
        border: open ? "2px dashed red" : "2px dashed #eee",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {open ? (
        <div style={modalStyle}>
          <>
            {children ? (
              children
            ) : (
              <span style={{ color: "red" }}>Modal children is empty</span>
            )}
          </>
          {actions && Array.isArray(actions) && (
            <div
              style={{
                marginTop: theme.spacing.md,
                display: "flex",
                gap: theme.spacing.sm,
              }}
            >
              {actions.map((action, idx) =>
                React.isValidElement(action)
                  ? React.cloneElement(action, { key: idx })
                  : null
              )}
            </div>
          )}
          <button style={{ marginTop: theme.spacing.md }} onClick={onClose}>
            關閉
          </button>
        </div>
      ) : null}
    </div>
  );
}
