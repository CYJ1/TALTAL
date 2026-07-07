import { ImageResponse } from 'next/og';
import { LockIcon } from '@/lib/pwa-icon';

export function GET() {
  return new ImageResponse(<LockIcon canvas={512} maskable />, { width: 512, height: 512 });
}
