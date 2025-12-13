import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

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
      <body>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}

