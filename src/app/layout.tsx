import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { PostHogPageView } from "@/components/posthog-pageview";
import { PostHogProvider } from "@/components/posthog-provider";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevRoast",
  description: "Paste your code. Get roasted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: required for third-party analytics snippet
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
            `,
          }}
        />
      )}
      <body className="font-sans antialiased">
        <PostHogProvider>
          <Suspense fallback={<div className="min-h-screen bg-bg-page" />}>
            <PostHogPageView />
            <TRPCReactProvider>
              <Navbar />
              {children}
            </TRPCReactProvider>
          </Suspense>
        </PostHogProvider>
      </body>
    </html>
  );
}
