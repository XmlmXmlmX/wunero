import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-provider";
import { WuNavbar } from "@/components/organisms/WuNavbar/WuNavbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wunero - Joy starts with a wish.",
  description: "An open, lightweight wishlist app to collect, organize, and share wishes with others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <WuNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
