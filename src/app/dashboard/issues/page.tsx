'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { IssueTable } from '@/features/issues/components/IssueTable';

export default function IssuesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Issues" description="View and monitor booking issues reported by users." />
      <IssueTable />
    </div>
  );
}
