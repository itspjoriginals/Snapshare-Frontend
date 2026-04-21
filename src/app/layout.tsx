import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import snapsharelogo from "@/assets/snapsharelogo.png";
import AuthProvider from "@/components/AuthProvider"; // ✅ NEW

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapShare",
  description: "A file sharing app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={snapsharelogo.toString()} />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <AuthProvider> {/* ✅ WRAPPED */}
            {children}
          </AuthProvider>
          <ToastContainer />
        </ReduxProvider>
      </body>
    </html>
  );
}