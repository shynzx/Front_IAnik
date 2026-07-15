import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/providers/AuthProvider";
import { FeedbackProvider } from "@/providers/FeedbackProvider";
import { Suspense } from "react";

const poppins = Poppins({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PromptGPA",
  description: "",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased font-sans`}
      >
        <ErrorBoundary><AuthProvider><FeedbackProvider><Suspense fallback={<div className="app-background flex min-h-screen items-center justify-center"><span className="ui-loader" /></div>}>{children}</Suspense></FeedbackProvider></AuthProvider></ErrorBoundary>
      </body>
    </html>
  );
}
