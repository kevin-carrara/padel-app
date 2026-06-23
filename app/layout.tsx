import type { Metadata } from 'next'
import { Playfair_Display, Montserrat, Inter, Raleway } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  title: { default: 'AJClubPadel', template: '%s | AJClubPadel' },
  description: 'Reserva tu cancha de padel en segundos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable} ${inter.variable} ${raleway.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#EBE9DF] text-[#34252F]">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid rgba(52,37,47,0.1)',
              color: '#34252F',
              fontFamily: 'var(--font-montserrat)',
              fontSize: '14px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(52,37,47,0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}