import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/context/AudioContext";
import 'reactflow/dist/style.css';
import { ProfileProvider } from "@/app/(auth)/CurrentProfile";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "NepVoice",
  description: "Leading Nepali AI Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AudioProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider> 
        </AudioProvider>
      </body>
    </html>
  );
}