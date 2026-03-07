'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  /** 0-based current page index */
  pageIndex: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}

function getPageRange(current: number, total: number): (number | '...')[] {
  // current is 1-based here
  // Always show at most 5 page numbers; use ellipsis beyond that
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  const result: (number | '...')[] = [1];
  if (left > 2) result.push('...');
  for (let i = left; i <= right; i++) result.push(i);
  if (right < total - 1) result.push('...');
  result.push(total);

  return result;
}

export function TablePagination({ pageIndex, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const current = pageIndex + 1; // convert to 1-based
  const pages = getPageRange(current, totalPages);

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border/60"
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === current ? 'default' : 'outline'}
            size="icon"
            className={cn(
              'h-8 w-8 text-xs border-border/60',
              page === current && 'pointer-events-none'
            )}
            onClick={() => onPageChange((page as number) - 1)}
          >
            {page}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border/60"
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex >= totalPages - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
