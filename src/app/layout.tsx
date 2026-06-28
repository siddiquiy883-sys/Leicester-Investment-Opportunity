import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIP Allocation - Springbok Real Estate & Sobha Realty",
  description: "Exclusive Dubai real estate event in Leicester, UK. Premium allocations starting at £150,000.",
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
