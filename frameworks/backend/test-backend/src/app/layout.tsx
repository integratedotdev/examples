import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js x Integrate",
  description: "Next.js integration with Integrate SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="m-0 w-full h-full flex flex-col items-center justify-center gap-4">
        {children}
      </body>
    </html>
  );
}
