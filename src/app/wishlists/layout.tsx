import { AuthProvider } from "@/lib/auth-provider";

export default function WishlistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
