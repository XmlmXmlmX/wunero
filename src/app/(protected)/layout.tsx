import { AuthProvider } from "@/lib/auth-provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
