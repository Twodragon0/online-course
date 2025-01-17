import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { ChatBot } from "@/components/chat-bot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Online Course Platform",
  description: "Transform your business with our online courses and AI-powered learning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Navbar />
            <main className="pt-[73px]">
              {children}
            </main>
            <ChatBot />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
