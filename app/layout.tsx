import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EverVibe · A world for two",
  description: "Discover what you can love together. Four relationship stories and a personal cultural discovery experience powered by Qloo and EVE.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
