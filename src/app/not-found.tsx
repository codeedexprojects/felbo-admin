import Link from 'next/link';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <AlertOctagon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
