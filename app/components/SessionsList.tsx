'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessions, updateSession, deleteSession } from '@/lib/api';
import type { SessionWithRelations, SessionStatus } from '@/lib/types';
import SessionFilters from './SessionFilters';
import SessionTable from './SessionTable';
import CreateSessionModal from './CreateSessionModal';
import { useToast } from '../contexts/ToastContext';

export default function SessionsList() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    therapist_id?: string;
    therapist_name?: string;
    date_from?: string;
    date_to?: string;
    page: number;
    limit: number;
  }>({
    page: 1,
    limit: 10,
  });
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSessions({ ...filters, sort_order: sortOrder });
      setSessions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [filters, sortOrder]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateSession(id, { status: status as SessionStatus });
      showToast(`Session status updated to ${status}`, 'success');
      await fetchSessions();
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
      await fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchSessions();
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
          >
            Create Session
          </button>
        </div>

        <SessionFilters
          filters={filters}
          onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters, page: 1 })}
        />

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No sessions found. Create one to get started.
          </div>
        ) : (
          <>
            <SessionTable
              sessions={sessions}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              sortOrder={sortOrder}
              onSortToggle={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total}{' '}
                sessions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.totalPages}
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

