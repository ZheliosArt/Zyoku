import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
title: 'Zyoku',
description: 'Comunidad de arte anime y manga',
icons: {
icon: '/Logo-Zyoku.avif', // Esto busca el archivo en la carpeta public o app
},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#050d1a' }}>
        <Nav />
        {children}
      </body>
    </html>
  )
}

