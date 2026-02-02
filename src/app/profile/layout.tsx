import { AuthProvider } from "@/lib/auth-provider";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
