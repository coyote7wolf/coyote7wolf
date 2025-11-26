import React from "react";

export const Button = ({ title }) => (
  <button
    style={{
      background: "#007AFF",
      color: "#fff",
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
    }}
  >
    {title}
  </button>
);
