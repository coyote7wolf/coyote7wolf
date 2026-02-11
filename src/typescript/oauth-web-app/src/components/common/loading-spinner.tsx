export function LoadingSpinner() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid var(--color-neutral-200)",
    borderTop: "4px solid var(--color-primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    marginTop: "16px",
    fontSize: "16px",
    fontWeight: 500,
  },
};
