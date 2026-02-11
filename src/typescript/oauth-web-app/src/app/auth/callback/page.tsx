import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Code Splitting: Dynamically import AuthCallbackPage
const AuthCallbackPage = dynamic(
  () =>
    import("@/components/pages/auth-callback").then((mod) => ({
      default: mod.AuthCallbackPage,
    })),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  },
);

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackPage />
    </Suspense>
  );
}
