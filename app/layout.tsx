import "./globals.css";
import { Figtree } from "next/font/google";

const sans = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = { title: "Prescription help", description: "Send an unclear prescription and get an answer." };
export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans`}>{children}</body>
    </html>
  );
}
