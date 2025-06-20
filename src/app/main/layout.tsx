import type { Metadata } from "next";
import 'reactflow/dist/style.css';
import Sidebar from "@/components/shared/Sidebar";
import ProtectedLayout from "./protectedlayout";

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
    <ProtectedLayout> 
      <div className="flex min-h-screen">
          <Sidebar /> 
          <main className="flex-1">
            {children}
          </main>
      </div>
    </ProtectedLayout>
  );
}
