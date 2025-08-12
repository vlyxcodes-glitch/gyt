import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "BookVault - Discover & Download Books",
  description: "Search and download millions of books from Anna's Archive with our intelligent search engine and instant download options.",
  keywords: ["BookVault", "books", "Anna's Archive", "download", "search", "library"],
  authors: [{ name: "BookVault Team" }],
  openGraph: {
    title: "BookVault",
    description: "Search and download millions of books with instant download options",
    url: "https://bookvault.vercel.app",
    siteName: "BookVault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookVault",
    description: "Search and download millions of books with instant download options",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
