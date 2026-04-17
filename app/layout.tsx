import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { CrispProvider } from '@/components/providers/CrispProvider';
import TourProvider from '@/components/providers/TourProvider';
import Script from 'next/script';

const title = 'Next.js Subscription Starter';
const description = 'Brought to you by Vercel, Stripe, and Supabase.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-black">
        <TourProvider>
          <PostHogProvider>
          <Navbar />
          <main
            id="skip"
            className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
          >
            {children}
          </main>
          <Footer />
          <Suspense>
            <Toaster />
          </Suspense>
        </PostHogProvider>
        </TourProvider>
        <CrispProvider />
        {/* Tolt Affiliate Script */}
        <Script strategy="lazyOnload" src="https://cdn.tolt.io/tolt.js" data-tolt={process.env.NEXT_PUBLIC_TOLT_API_KEY} />
      </body>
    </html>
  );
}
