import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustLayer | AI Payment Risk & Decisioning Engine (Razorpay)',
  description: 'Not just a risk score — a reason. Explainable AI payment fraud manager and merchant intelligence platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
