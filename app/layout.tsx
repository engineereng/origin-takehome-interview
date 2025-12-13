import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Origin Therapy - Session Dashboard',
  description: 'Therapist Session Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

