import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "AI Function Calling & Tool Schema Generator | Himat Technologies",
  description:
    "Build, validate, test and convert AI function calling and tool schemas for OpenAI, Claude, LangChain and other AI platforms directly in your browser.",
  keywords: [
    "AI function calling",
    "tool schema generator",
    "JSON schema generator",
    "OpenAI tools",
    "Claude tools",
    "MCP",
    "AI agents",
    "function calling",
    "LangChain",
    "AI developer tools",
  ],
  authors: [{ name: "Himat Technology", url: "https://himat.co.in" }],
  openGraph: {
    title:
      "AI Function Calling & Tool Schema Generator | Himat Technologies",
    description:
      "Build, validate, test and convert AI function calling and tool schemas for OpenAI, Claude, LangChain and other AI platforms directly in your browser.",
    type: "website",
    locale: "en_US",
    siteName: "Himat Technology",
    url: "https://himat.tech/free-tools/ai-function-calling-schema-generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Function Calling & Tool Schema Generator",
    description:
      "Build, validate, test and convert AI function calling and tool schemas in your browser.",
  },
  metadataBase: new URL("https://himat.co.in"),
  alternates: {
    canonical:
      "https://himat.tech/free-tools/ai-function-calling-schema-generator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
      style={{ backgroundColor: "#070b12", color: "#f8fafc" }}
      suppressHydrationWarning
    >
      <body
        className={`${plexSans.className} antialiased`}
        style={{
          backgroundColor: "#070b12",
          color: "#f8fafc",
          margin: 0,
          minHeight: "100vh",
        }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
