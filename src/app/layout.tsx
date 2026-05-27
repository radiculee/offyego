import type { Metadata } from 'next';
import { Geist, Geist_Mono, Nunito, Vollkorn } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* Local Lad theme fonts - classical warm serif for display, friendly rounded sans for body */
const vollkorn = Vollkorn({
  variable: '--font-vollkorn',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const nunito = Nunito({
  variable: '--font-nunito',
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
      className={`${geistSans.variable} ${geistMono.variable} ${vollkorn.variable} ${nunito.variable} h-full antialiased`}
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
