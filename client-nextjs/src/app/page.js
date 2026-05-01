'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  // Simple redirect to dashboard
  router.push('/dashboard');
  return null;
}
