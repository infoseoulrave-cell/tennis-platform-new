import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSessionToken, isValidAdminToken } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;

  const adminSecret = process.env.ADMIN_SECRET;
  if (
    !adminSecret
    || !isValidAdminToken(adminToken, createAdminSessionToken(adminSecret))
  ) {
    redirect("/admin-login");
  }

  return <>{children}</>;
}
