import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Beacon | Unified Student Operating System & AI Career Coach",
  description: "Your journey. Your direction. Verified internships, certificate locker, LinkedIn-style student passport, and tailored AI career guidance.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Beacon | Your journey. Your direction.",
    description: "Verified internships, LinkedIn-style student passport, certificate locker, and AI mentor.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; }
              html, body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                background-color: #f8fafc;
                color: #0f172a;
                margin: 0;
                padding: 0;
              }
              img { max-width: 100%; }
              .beacon-logo { width: 40px !important; height: 40px !important; object-fit: cover !important; }
              .google-icon { width: 20px !important; height: 20px !important; }
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
