import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zishun Gao — Personal Portfolio",
  description: "Zishun Gao's personal portfolio across finance, economics, risk management, data analysis, applied research and responsible AI-assisted workflows.",
  applicationName: "Zishun Gao Personal Portfolio",
  authors: [{ name: "Zishun Gao" }],
  creator: "Zishun Gao",
  category: "Personal portfolio",
  openGraph: {
    type: "website",
    title: "Zishun Gao — Personal Portfolio",
    description: "Zishun Gao's personal portfolio across finance, economics, risk management, data analysis, applied research and responsible AI-assisted workflows.",
    siteName: "Zishun Gao Personal Portfolio",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Zishun Gao — Personal Portfolio",
    description: "Zishun Gao's personal portfolio across finance, economics, risk management, data analysis, applied research and responsible AI-assisted workflows.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
