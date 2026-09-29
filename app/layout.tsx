import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Ubuntu } from "next/font/google";
import "./globals.css";
import { connection } from "next/server";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "variable",
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tekspyk.com"),
  title: {
    default: "TekSpyk | Learn AI by Building Real Software",
    template: "%s | TekSpyk",
  },
  description:
    "TekSpyk is the AI software engineering academy where you master AI, programming, and product delivery by shipping real applications. Join us.",
  openGraph: {
    title: "TekSpyk | Learn AI by Building Real Software",
    description:
      "Master AI, programming, and software engineering while building production-ready applications. Join us.",
    url: "https://tekspyk.com",
    siteName: "TekSpyk",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TekSpyk | Learn AI by Building Real Software",
    description:
      "Master AI, programming, and software engineering while building production-ready applications. Join us.",
  },
  alternates: {
    canonical: "https://tekspyk.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${ubuntu.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
