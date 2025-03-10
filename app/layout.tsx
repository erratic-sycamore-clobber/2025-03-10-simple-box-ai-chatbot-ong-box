import type { Metadata } from 'next';
import './globals.css';
// Use the official Bootstrap CDN for the latest version with dark mode support
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import BootstrapClient from './components/BootstrapClient';

export const metadata: Metadata = {
  title: 'Simple Box AI Chatbot',
  description: 'A minimalist chatbot using Box AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-body">
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}