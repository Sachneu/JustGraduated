// app/layout.js (Server Component)
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme";
import Header from "@/components/ui/header";
import LayoutWrapper from "@/components/ui/LayoutWrapper";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Just Graduated",
  description: "AI-powered resume optimization and job prep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClerkProvider>
          <LayoutWrapper>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Header /> {/* No need to pass userId here anymore */}
              <main className="min-h-screen">{children}</main>
              <footer className="bg-muted/55 py-5">
                <div className="container mx-auto px-2 text-center text-gray-450">
                  <p>Made with Love by Sachet Neupane</p>
                </div>
              </footer>
            </ThemeProvider>
          </LayoutWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}