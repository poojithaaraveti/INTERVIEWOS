import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";

export const metadata: Metadata = {
  title: "INTERVIEWOS — AI-Powered Adaptive Interview Platform",
  description:
    "Dynamic evidence-based spoken interview intelligence. Continuous investigation of resume claims, knowledge depth analysis, and cryptographic integrity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="cyber-grid antialiased min-h-screen flex flex-col bg-obsidian-950 text-slate-100 selection:bg-cyber-cyan/30 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
