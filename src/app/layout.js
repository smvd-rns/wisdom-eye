import './globals.css';

export const metadata = {
  title: 'Wisdom Eye - Transform Your Life with Vedic Wisdom',
  description: 'Embark on a powerful meditation and spiritual journey based on the timeless wisdom of Bhagavad Gita. Course includes physical study material shipped to your doorstep.',
  keywords: 'Bhagavad Gita, Wisdom Eye, Spiritual Course, Meditation, ISKCON Pune, Radheshyam Das',
  authors: [{ name: 'ISKCON Pune VOICE' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

const DEFAULT_TENANT_DATA = {
  id: 'default',
  slug: 'wisdom-eye',
  name: 'Wisdom Eye',
  slogan: 'Vedic Character & Leadership Mentoring',
  description: 'Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.',
  address: 'ISKCON NVCC, Katraj-Kondhwa Road, Hare Krishna Chowk, Pune, Maharashtra 411048',
  email: 'manager@voicepune.com',
  phone: '+91 8605036000',
  primary_color: '#FF9F1C',
  secondary_color: '#1A1B4B'
};

export default function RootLayout({ children }) {
  const dynamicStyles = {
    '--primary-color': DEFAULT_TENANT_DATA.primary_color,
    '--secondary-color': DEFAULT_TENANT_DATA.secondary_color,
  };

  return (
    <html lang="en" style={dynamicStyles}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          id="tenant-data-script"
          dangerouslySetInnerHTML={{
            __html: `window.__TENANT_DATA__ = ${JSON.stringify(DEFAULT_TENANT_DATA)};`
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
