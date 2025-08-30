'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 flex w-full items-center justify-between rounded-lg border border-border/40 bg-background/95 p-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
    >
        <SidebarTrigger className="md:hidden" />
        <div className='flex items-center gap-2'>
            <h1 className="font-headline text-2xl font-bold text-foreground">
                Dashboard
            </h1>
        </div>
    </header>
  );
}
