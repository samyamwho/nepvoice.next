import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/context/AudioContext";
import 'reactflow/dist/style.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NepVoice",
  description: "Leading Nepali AIs Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
