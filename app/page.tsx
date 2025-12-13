import { Suspense } from 'react';
import SessionsList from './components/SessionsList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Therapist Session Dashboard</h1>
          <p className="mt-2 text-gray-600">View and manage therapy sessions</p>
        </div>

        <Suspense fallback={<SessionsListSkeleton />}>
          <SessionsList />
        </Suspense>
      </div>
    </main>
  );
}

function SessionsListSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

