import { QRTemplate } from '@/types';

export const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Gold',
    description: 'Elegant white background with warm gold borders and serif typography. Ideal for fine dine & bistros.',
    accentColor: '#D4A03C',
    bgStyle: 'light',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean borderless layout with coral accent pills and high readability sans-serif.',
    accentColor: '#FF6B6B',
    bgStyle: 'light',
  },
  {
    id: 'premium',
    name: 'Dark Luxe',
    description: 'High-contrast slate-900 dark theme with gold foil framing and shield emblem. Sleek & modern.',
    accentColor: '#EAB308',
    bgStyle: 'dark',
  },
  {
    id: 'vibrant',
    name: 'Vibrant Saffron',
    description: 'Warm saffron gradient with festive Indian motifs and Hindi/English order tagline.',
    accentColor: '#EA580C',
    bgStyle: 'gradient',
  },
  {
    id: 'festive',
    name: 'Festive Special',
    description: 'Decorative celebratory borders with sparkle accents for holidays and special events.',
    accentColor: '#8B5CF6',
    bgStyle: 'gradient',
  },
];
