import './globals.css';

export const metadata = {
  title: 'Radheshyam Das - Transform Your Life with Vedic Wisdom',
  description: 'Embark on a powerful meditation and spiritual journey based on the timeless wisdom of Bhagavad Gita. Course includes physical study material shipped to your doorstep.',
  keywords: 'Bhagavad Gita, Wisdom Eye, Spiritual Course, Meditation, ISKCON Pune, Radheshyam Das',
  authors: [{ name: 'ISKCON Pune VOICE' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
