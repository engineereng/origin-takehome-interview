'use client';

import { useState, useEffect, useRef } from 'react';
import type { SessionWithRelations } from '@/lib/types';

interface SessionTableProps {
  sessions: SessionWithRelations[];
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Canceled', 'No Show'] as const;

export default function SessionTable({
  sessions,
  onUpdateStatus,
  onDelete,
}: SessionTableProps) {
  const [hoveredStatusId, setHoveredStatusId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const dropdown = dropdownRefs.current[openDropdownId];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      case 'No Show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusClick = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === sessionId ? null : sessionId);
  };

  const handleStatusSelect = (sessionId: number, status: string) => {
    onUpdateStatus(sessionId, status);
    setOpenDropdownId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Therapist
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessions.map((session) => (
            <tr key={session.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {session.therapist_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {session.patient_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatDate(session.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative inline-block">
                  <div
                    className="inline-flex items-center gap-1 cursor-pointer group"
                    onMouseEnter={() => setHoveredStatusId(session.id)}
                    onMouseLeave={() => setHoveredStatusId(null)}
                    onClick={(e) => handleStatusClick(e, session.id)}
                  >
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                    {(hoveredStatusId === session.id || openDropdownId === session.id) && (
                      <svg
                        className="w-4 h-4 text-gray-600 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="edit"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                  </div>
                  {openDropdownId === session.id && (
                    <div
                      ref={(el) => {
                        dropdownRefs.current[session.id] = el;
                      }}
                      className="absolute left-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px] py-1"
                    >
                      {STATUS_OPTIONS.map((status, index) => {
                        const statusColor = getStatusColor(status);
                        return (
                          <button
                            key={`${session.id}-${status}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusSelect(session.id, status);
                            }}
                            className={`block w-full text-left px-3 py-2 text-xs font-semibold hover:opacity-80 transition-opacity ${statusColor} ${index === 0 ? 'rounded-t-md' : ''} ${index === STATUS_OPTIONS.length - 1 ? 'rounded-b-md' : ''} ${index > 0 ? 'border-t border-gray-300' : ''}`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onDelete(session.id)}
                  className="text-red-600 hover:text-red-900 text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

