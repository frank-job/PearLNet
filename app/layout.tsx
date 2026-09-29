import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import ThemeProvider from "@/app/ui/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "PearLNet",
  description: "Your Social media site for sharing and connecting",
};

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: any;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans w-full max-w-full overflow-x-hidden">
        <SessionProvider session={session}>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
