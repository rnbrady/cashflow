import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactFlowProvider } from '@xyflow/react';
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bitcoin Cash Transaction Graph Explorer",
  description: "A visual explorer for Bitcoin Cash transactions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ReactFlowProvider>
            {children}
          </ReactFlowProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

