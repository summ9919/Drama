import { Platform } from 'react-native';

export const displayFont = Platform.select({ ios: 'Georgia', default: 'serif' }) as string;

export const withAlpha = (hex: string, alpha: number) => {
  const value = Math.round(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, '0');
  return `${hex}${value}`;
};
