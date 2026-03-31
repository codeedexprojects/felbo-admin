'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPath = useRef(pathname);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    setWidth(15);
    let current = 15;
    intervalRef.current = setInterval(() => {
      current = Math.min(current + Math.random() * 12, 85);
      setWidth(current);
    }, 250);
  };

  const complete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setWidth(100);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);
  };

  // Start bar on internal link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto') ||
        href.startsWith('#')
      )
        return;
      if (href !== pathname) start();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  // Complete bar when navigation finishes (deferred to avoid setState-in-effect lint error)
  useEffect(() => {
    if (prevPath.current !== pathname) {
      const id = setTimeout(() => complete(), 0);
      prevPath.current = pathname;
      return () => clearTimeout(id);
    }
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] bg-primary shadow-[0_0_8px_0px] shadow-primary transition-[width] duration-300 ease-out"
      style={{ width: `${width}%` }}
    />
  );
}
