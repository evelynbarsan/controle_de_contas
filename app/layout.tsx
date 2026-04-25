import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PullToRefresh } from "./_components/PullToRefresh";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controle de Contas",
  description: "Gerencie suas contas e despesas mensais",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Contas" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}
