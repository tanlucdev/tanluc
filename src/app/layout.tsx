import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Soundscape } from "@/components/Soundscape";
import { TabIcon } from "@/components/TabIcon";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://tanluc.dev"),
  title: "Tan Luc — Software Engineer",
  description: "Tan Luc is a software engineer based in Vietnam, building frontend and full-stack products with React, Next.js, TypeScript, and NestJS.",
  openGraph: {
    siteName: "Tan Luc",
    title: "Tan Luc — Software Engineer",
    description: "Software engineer in Vietnam. Explore AI workflow tools, Cafe Maps, MedicHIMS, and Grateful Forum.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TabIcon />
        <Soundscape />
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
