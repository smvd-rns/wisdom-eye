import { headers } from 'next/headers';
import { getActiveTenant } from '@/lib/tenant';
import './globals.css';

export async function generateMetadata() {
  const reqHeaders = headers();
  const tenant = await getActiveTenant({ headers: reqHeaders });
  
  const title = tenant.name 
    ? `${tenant.name} - ${tenant.slogan || 'Transform Your Life with Vedic Wisdom'}`
    : 'Radheshyam Das - Transform Your Life with Vedic Wisdom';

  return {
    title: title,
    description: tenant.description || 'Embark on a powerful meditation and spiritual journey based on the timeless wisdom of Bhagavad Gita. Course includes physical study material shipped to your doorstep.',
    keywords: 'Bhagavad Gita, Wisdom Eye, Spiritual Course, Meditation, ISKCON Pune, Radheshyam Das',
    authors: [{ name: tenant.name || 'ISKCON Pune VOICE' }],
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default async function RootLayout({ children }) {
  const reqHeaders = headers();
  
  // Resolve active tenant dynamically
  const tenant = await getActiveTenant({ headers: reqHeaders });

  const dynamicStyles = {
    '--primary-color': tenant.primary_color || '#FF9F1C',
    '--secondary-color': tenant.secondary_color || '#1A1B4B',
  };

  return (
    <html lang="en" style={dynamicStyles}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          id="tenant-data-script"
          dangerouslySetInnerHTML={{
            __html: `window.__TENANT_DATA__ = ${JSON.stringify({
              id: tenant.id || 'default',
              slug: tenant.slug || 'wisdom-eye',
              name: tenant.name || 'Wisdom Eye',
              slogan: tenant.slogan || 'Vedic Character & Leadership Mentoring',
              description: tenant.description || 'Vedic Character & Leadership Mentoring under VOICE and VOICE Publication, ISKCON Pune.',
              address: tenant.address || 'Govardhan Ecovillage, Wada, Maharashtra',
              email: tenant.email || 'manager@voicepune.com',
              phone: tenant.phone || '+91 8605036000'
            })};`
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
