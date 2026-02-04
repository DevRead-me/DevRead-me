import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevRead.me",
  description:
    "Transform your code into beautiful Docsify documentation with AI-powered analysis. Powered by Groq Cloud.",
  keywords: [
    "documentation",
    "AI",
    "Groq",
    "Docsify",
    "code analysis",
    "markdown",
  ],
  authors: [{ name: "DevRead.me Team" }],
  viewport: "width=device-width, initial-scale=1.0",
  openGraph: {
    title: "DevRead.me",
    description:
      "Transform your code into beautiful Docsify documentation with AI-powered analysis.",
    type: "website",
    url: "https://devreadme.jumpstone4477.de",
  },
  icons: {
    icon: "https://jumpstone4477.de/devreadme/assets/img/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050505" />
      </head>
      <body className="app-body">{children}</body>
    </html>
  );
}
