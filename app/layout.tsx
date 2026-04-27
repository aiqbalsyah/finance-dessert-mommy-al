import { Suspense } from "react"
import type { Metadata } from "next"
import { Sora, Roboto_Condensed, Ubuntu_Mono } from "next/font/google"
import { QueryProvider } from "@/context/query-provider"
import { AuthProvider } from "@/context/auth-provider"
import { ThemeProvider } from "@/context/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
})

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sora.variable} ${robotoCondensed.variable} ${ubuntuMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider>
                <Suspense
                  fallback={
                    <div className="flex min-h-screen items-center justify-center">
                      <Spinner className="text-muted-foreground size-6" />
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
