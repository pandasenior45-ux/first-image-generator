import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelForge — AI Image Studio",
  description: "Create beautiful AI images with Cloudflare Workers AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
