'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Steps = dynamic(() => import('intro.js-react').then(mod => mod.Steps), {
  ssr: false,
});

import 'intro.js/introjs.css';

export default function TourProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('tour_completed')) {
      const timer = setTimeout(() => setEnabled(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      element: '.demo-step-1',
      intro: 'Bienvenue sur notre plateforme SaaS ultime ! 🎉',
      position: 'right',
    },
    {
      element: '.demo-step-2',
      intro: 'Sélectionnez un abonnement ci-dessous pour démarrer.',
      position: 'bottom',
    },
  ];

  return (
    <>
      <Steps
        enabled={enabled}
        steps={steps}
        initialStep={0}
        onExit={() => {
          setEnabled(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('tour_completed', 'true');
          }
        }}
      />
      {children}
    </>
  );
}
