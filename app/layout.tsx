import type { Metadata } from "next";
import "./globals.css";
import "./responsive-readability.css";
import { LANGUAGE_BOOTSTRAP } from "./language-bootstrap";

export const metadata: Metadata = {
  title: "Zishun Gao — Personal Portfolio",
  description: "Zishun Gao's personal portfolio across finance, economics, risk management, data analysis, applied research and responsible AI-assisted workflows.",
  applicationName: "Zishun Gao Personal Portfolio",
  authors: [{ name: "Zishun Gao" }],
  creator: "Zishun Gao",
  category: "Personal portfolio",
  // Prefixed here because the RSC payload (re-rendered after hydration) is not path-rewritten by the export script.
  icons: { icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/favicon.svg`, type: "image/svg+xml" }] },
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
    // LANGUAGE_BOOTSTRAP may switch lang to zh-CN before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stylesheets @import these font hosts; opening the connections early shortens the render-blocking chain. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: LANGUAGE_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
