import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Idea Synthesizer — Conduit Ventures",
  description:
    "Turn what you already know into something that works for you. Discover your vertical, map your monetization, and take the first step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Source+Sans+Pro:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream font-sans text-text antialiased">
        {children}
      </body>
    </html>
  );
}
