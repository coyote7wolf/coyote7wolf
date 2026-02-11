import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Code Splitting: Dynamically import LoginPage to reduce initial bundle
const LoginPage = dynamic(
  () =>
    import("@/components/pages/login").then((mod) => ({
      default: mod.LoginPage,
    })),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  },
);

export const metadata: Metadata = {
  title: "Login - React Web App",
  description: "Login to your account",
};

export default function Page() {
  return <LoginPage />;
}
