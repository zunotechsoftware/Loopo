'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/routes/routes';

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.SELL_CATEGORY);
  }, [router]);

  return null;
}
