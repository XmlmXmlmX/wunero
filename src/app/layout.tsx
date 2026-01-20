import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-provider";
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
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
