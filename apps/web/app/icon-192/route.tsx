import { ImageResponse } from 'next/og';
import { LockIcon } from '@/lib/pwa-icon';

export function GET() {
  return new ImageResponse(<LockIcon canvas={192} />, { width: 192, height: 192 });
}
