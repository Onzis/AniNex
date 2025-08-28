import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NotificationsProvider } from "@/components/notifications-provider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AniNex - Аниме портал с плеерами Kodik и Alloha",
  description: "Лучший портал для просмотра аниме онлайн с плеерами Kodik, Alloha и Turbo. Высокое качество видео, удобный интерфейс.",
  keywords: ["аниме", "онлайн", "смотреть", "kodik", "alloha", "turbo", "плеер", "shikimori"],
  authors: [{ name: "AniNex Team" }],
  openGraph: {
    title: "AniNex - Аниме портал",
    description: "Смотрите аниме онлайн с лучшими плеерами",
    url: "https://aninex.vercel.app",
    siteName: "AniNex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AniNex - Аниме портал",
    description: "Смотрите аниме онлайн с лучшими плеерами",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
