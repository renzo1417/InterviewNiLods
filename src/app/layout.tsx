import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Interview ni Lods — Practice now, panic less later.",
  description:
    "Meet Sir Bot, your AI interview coach. Make it your interview, find your words, and walk into your next conversation feeling ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.motionReady='1';",
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-[#242126] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
