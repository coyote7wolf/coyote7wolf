import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Code Splitting: Dynamically import DashboardPage to reduce initial bundle
const DashboardPage = dynamic(
  () =>
    import("@/components/pages/dashboard").then((mod) => ({
      default: mod.DashboardPage,
    })),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  },
);

export const metadata: Metadata = {
  title: "Dashboard - React Web App",
  description: "User dashboard",
};

export default function Page() {
  return <DashboardPage />;
}
