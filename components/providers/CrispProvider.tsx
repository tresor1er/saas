'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export function CrispProvider() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

      (function () {
        const d = document;
        const s = d.createElement('script');
        s.src = 'https://client.crisp.chat/l.js';
        s.async = 1;
        d.getElementsByTagName('head')[0].appendChild(s);
      })();
    }
  }, []);

  return null;
}
