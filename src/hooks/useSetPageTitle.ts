'use client';

import { useEffect } from 'react';
import { usePageTitleStore } from '@/stores/uiStore';

export function useSetPageTitle(title: string | null | undefined) {
  const setPageTitle = usePageTitleStore((s) => s.setPageTitle);

  useEffect(() => {
    if (title) setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);
}
