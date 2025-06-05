import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AudioProvider } from "@/components/context/AudioContext";
import 'reactflow/dist/style.css';
import Sidebar from "@/components/shared/Sidebar";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <AudioProvider>
          <div className="flex min-h-screen">
            <Sidebar /> 
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AudioProvider>
      </body>
    </html>
  );
}
