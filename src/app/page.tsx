"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirige a la página del buscador como nuevo punto de entrada
    router.replace('/buscador');
  }, [router]);

  return null; // O un componente de carga mientras se redirige
}
