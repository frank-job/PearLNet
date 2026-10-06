import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import ThemeProvider from "@/app/ui/theme/ThemeProvider";
import AppShell from "@/app/components/AppShell";

export const metadata: Metadata = {
  title: "PearLNet",
  description: "Your Social media site for sharing and connecting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans w-full max-w-full overflow-x-hidden">
        <SessionProvider>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}