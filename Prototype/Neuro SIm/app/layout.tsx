import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neuro Sim",
  description: "Visualize and Learn Neural Networks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
