import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'בריתה מילי ארביב',
  description: 'RSVP לחגיגת בריתה מילי ארביב',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-cream text-charcoal font-sans min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
