import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MergenFlow - Freelance & Finansal Özgürlük Platformu",
    template: "%s | MergenFlow",
  },
  description: "Freelance projelerinizi yönetin, finansal hedeflerinize ulaşın. Müşteri, proje, gelir-gider takibi ve finansal projeksiyon.",
  keywords: ["freelance", "proje yönetimi", "finansal özgürlük", "müşteri yönetimi", "gelir gider", "fatura", "CRM"],
  authors: [{ name: "MergenFlow" }],
  creator: "MergenFlow",
  publisher: "MergenFlow",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://mergenflow.com",
    siteName: "MergenFlow",
    title: "MergenFlow - Freelance & Finansal Özgürlük Platformu",
    description: "Freelance projelerinizi yönetin, finansal hedeflerinize ulaşın.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MergenFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MergenFlow - Freelance & Finansal Özgürlük Platformu",
    description: "Freelance projelerinizi yönetin, finansal hedeflerinize ulaşın.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MergenFlow",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
