'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateSession, deleteSession } from '@/lib/api';
import type { SessionWithRelations, SessionStatus, PaginatedResponse } from '@/lib/types';
import SessionFilters from './SessionFilters';
import SessionTable from './SessionTable';
import CreateSessionModal from './CreateSessionModal';
import { useToast } from '../contexts/ToastContext';

interface SessionsListClientProps {
  initialData: PaginatedResponse<SessionWithRelations>;
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

export default function SessionsListClient({ initialData, searchParams }: SessionsListClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentPage = parseInt(searchParams.page || '1', 10);
  const currentLimit = parseInt(searchParams.limit || '10', 10);
  const currentSortOrder = (searchParams.sort_order || 'ASC') as 'ASC' | 'DESC';

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    // Preserve existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleFilterChange = (newFilters: {
    status?: string;
    therapist_id?: string;
    therapist_name?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const updates: Record<string, string | undefined> = { ...newFilters, page: '1' };
    updateSearchParams(updates);
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
  };

  const handleSortToggle = () => {
    const newSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
    updateSearchParams({ sort_order: newSortOrder });
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateSession(id, { status: status as SessionStatus });
      showToast(`Session status updated to ${status}`, 'success');
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }
    try {
      await deleteSession(id);
      showToast('Session deleted successfully', 'success');
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const filters = {
    status: searchParams.status,
    therapist_id: searchParams.therapist_id,
    therapist_name: searchParams.therapist_name,
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
    page: currentPage,
    limit: currentLimit,
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isPending}
          >
            Create Session
          </button>
        </div>

        <SessionFilters filters={filters} onFilterChange={handleFilterChange} />

        {initialData.data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No sessions found. Create one to get started.
          </div>
        ) : (
          <>
            <SessionTable
              sessions={initialData.data}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              sortOrder={currentSortOrder}
              onSortToggle={handleSortToggle}
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * currentLimit) + 1} to{' '}
                {Math.min(currentPage * currentLimit, initialData.pagination.total)} of {initialData.pagination.total}{' '}
                sessions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isPending}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= initialData.pagination.totalPages || isPending}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateSessionModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

