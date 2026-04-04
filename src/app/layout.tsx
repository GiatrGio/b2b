import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B Marketplace",
  description: "Connecting restaurants with suppliers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
