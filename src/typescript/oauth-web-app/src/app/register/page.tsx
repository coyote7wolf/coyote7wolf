import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Code Splitting: Dynamically import the named `RegisterPage` export
const RegisterPage = dynamic(
  () => import("@/components/pages/register").then((mod) => mod.RegisterPage),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  },
);

export const metadata: Metadata = {
  title: "Register - React Web App",
  description: "Create a new account",
};

export default function Page() {
  return <RegisterPage />;
}
