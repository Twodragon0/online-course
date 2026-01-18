import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { ChatBot } from "@/components/chat-bot";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import ErrorBoundary from "@/components/error-boundary"; // Import ErrorBoundary

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edu Platform - Transform Blog Posts into Online Courses",
  description: "Convert your tech.2twodragon.com blog content into engaging online courses with video, audio, and AI-powered enhancements. Create, publish, and monetize your knowledge.",
  keywords: ["online courses", "blog to course", "content creation", "DevSecOps", "AI learning", "course platform"],
  authors: [{ name: "2twodragon" }],
  creator: "2twodragon",
  publisher: "2twodragon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://edu.2twodragon.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Edu Platform - Transform Blog Posts into Online Courses",
    description: "Convert your tech.2twodragon.com blog content into engaging online courses with video, audio, and AI-powered enhancements.",
    url: "https://edu.2twodragon.com",
    siteName: "Edu Platform",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Edu Platform - Transform Blog Posts into Online Courses",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edu Platform - Transform Blog Posts into Online Courses",
    description: "Convert your tech.2twodragon.com blog content into engaging online courses with video, audio, and AI-powered enhancements.",
    images: ["/og-image.jpg"],
    creator: "@2twodragon",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
          <ErrorBoundary>
            <Providers>
              <Navbar />
              <main className="pt-16">{children}</main>
              <ChatBot />
            </Providers>
          </ErrorBoundary>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />

        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Edu Platform",
              "description": "Transform blog posts into online courses with AI-powered enhancements",
              "url": "https://edu.2twodragon.com",
              "sameAs": [
                "https://tech.2twodragon.com"
              ],
              "publisher": {
                "@type": "Organization",
                "name": "2twodragon",
                "url": "https://edu.2twodragon.com"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://edu.2twodragon.com/courses?search={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "offers": {
                "@type": "Offer",
                "category": "Online Course Platform",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
