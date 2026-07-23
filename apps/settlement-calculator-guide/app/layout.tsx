import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Personal Injury Settlement Calculator | Estimate Claim Value",
  description: "Build a transparent personal injury settlement planning range from documented losses, injury impact, and possible fault—without a lead form.",
  applicationName: "Settlement Calculator Guide",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Personal Injury Settlement Calculator",
    description: "A transparent settlement planning tool that shows its formula and assumptions.",
    url: `${siteUrl}/`,
    siteName: "Settlement Calculator Guide",
    type: "website",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Settlement Calculator Guide — estimate the range and inspect the assumptions" }],
  },
  twitter: { card: "summary_large_image", title: "Settlement Calculator Guide", description: "Estimate a claim range. Inspect every assumption.", images: [`${siteUrl}/og.png`] },
  icons: { icon: `${siteUrl}/favicon.png`, shortcut: `${siteUrl}/favicon.png` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
