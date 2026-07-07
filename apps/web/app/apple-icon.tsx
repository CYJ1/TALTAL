import { ImageResponse } from 'next/og';
import { LockIcon } from '@/lib/pwa-icon';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<LockIcon canvas={180} />, { ...size });
}
