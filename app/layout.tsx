import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

import "./styles/login.css";
import "./styles/public.css";
import "./styles/admin.css";
import "./styles/sidebar.css";
import "./styles/dashboard.css";
import "./styles/table.css";
import "./styles/detail.css";
import "./styles/form.css";
import "./styles/button.css";
import "./styles/responsive.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Informasi Surat Desa",
  description: "Sistem Informasi Pelayanan Surat Desa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={2500}
          expand={false}
          visibleToasts={3}
        />
      </body>
    </html>
  );
}