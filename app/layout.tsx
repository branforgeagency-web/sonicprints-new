import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartDrawer, FloatingCart } from "@/components/cart";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/nav";
import "./globals.css";

const roboto = localFont({
  src: [
    { path: "./public/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf", weight: "100 900", style: "normal" },
    { path: "./public/fonts/Roboto/Roboto-Italic-VariableFont_wdth,wght.ttf", weight: "100 900", style: "italic" },
  ],
  // Fixed family name so canvas code can reference "Roboto" directly.
  declarations: [{ prop: "font-family", value: "Roboto" }],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SonicPrints",
  description: "SonicPrints website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <Navbar />
        {children}
        <Footer />
        <FloatingCart />
        <CartDrawer />
      </body>
    </html>
  );
}
