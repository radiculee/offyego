import type { Metadata } from 'next';
import { DM_Sans, Fraunces, Geist, Geist_Mono, Inter, Oswald } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* Grumpy Barman theme fonts */
const oswald = Oswald({
  variable: '--font-grumpy-display',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-grumpy-body',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

/* Local Lad theme fonts */
const fraunces = Fraunces({
  variable: '--font-local-display',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-local-body',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Off Ye Go: Can't pick a pub? We'll pick one.",
  description:
    'A sarcastic pub randomiser for the Republic of Ireland. Hit spin, get a pub, get a dare, go drink.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IE"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${inter.variable} ${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var raw=localStorage.getItem('offyego:personality');var p=raw?JSON.parse(raw):null;var cls=p==='LOCAL_LAD'?'theme-local-lad':'theme-grumpy-barman';document.documentElement.classList.add(cls);}catch(e){document.documentElement.classList.add('theme-grumpy-barman');}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
