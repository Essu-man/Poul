import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: true,
});