import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-provider";
import { WuNavbar } from "@/components/organisms/WuNavbar/WuNavbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wunero - Joy starts with a wish.",
  description: "An open, lightweight wishlist app to collect, organize, and share wishes with others.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wunero",
  },
  applicationName: "Wunero",
  themeColor: "#000",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180" },
    ],
  },
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
          <WuNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
