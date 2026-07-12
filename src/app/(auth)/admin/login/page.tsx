import { Suspense } from "react";
import { AdminLoginCard } from "@/components/admin-login-card";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginCard />
    </Suspense>
  );
}
