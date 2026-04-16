import type { Metadata } from "next";
import { Inter, Nunito_Sans } from "next/font/google";
import { Nav } from "@/components/public/Nav";
import { Footer } from "@/components/public/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito-sans",
  weight: ["300", "400", "600", "700"],
  style: ["normal"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "Carreiras | Welcome Group",
    template: "%s | Carreiras Welcome Group",
  },
  description:
    "Construa sua carreira em um lugar que transforma sonhos em destinos. Veja as vagas abertas no Welcome Group.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://welcome-carreiras.vercel.app"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${nunitoSans.variable}`}>
      <body className="bg-wt-off-white font-wt-body text-wt-gray-700 antialiased">
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
