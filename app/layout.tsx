import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/app/ui/theme/ThemeProvider";

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
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
