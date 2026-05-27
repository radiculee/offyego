import type { Metadata } from 'next';
import { Geist, Geist_Mono, Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* Local Lad theme fonts - friendly slightly-quirky display serif, clean rounded body */
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
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
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${dmSans.variable} h-full antialiased`}
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
