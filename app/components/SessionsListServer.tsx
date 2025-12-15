import { Suspense } from 'react';
import { getSessionsServer } from '@/lib/sessions-server';
import SessionsListClient from './SessionsListClient';
import SessionsListSkeleton from './SessionsListSkeleton';

interface SessionsListServerProps {
  searchParams: {
    status?: string;
    therapist_id?: string;
    therapist_name?: string;
    date_from?: string;
    date_to?: string;
    sort_order?: string;
    page?: string;
    limit?: string;
  };
}

async function SessionsListServer({ searchParams }: SessionsListServerProps) {
  const response = await getSessionsServer(searchParams);

  return <SessionsListClient initialData={response} searchParams={searchParams} />;
}

export function SessionsListWithSuspense({ searchParams }: SessionsListServerProps) {
  return (
    <Suspense fallback={<SessionsListSkeleton />}>
      <SessionsListServer searchParams={searchParams} />
    </Suspense>
  );
}

