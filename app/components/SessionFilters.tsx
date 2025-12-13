'use client';

interface SessionFiltersProps {
  filters: {
    status?: string;
    therapist_id?: string;
    page: number;
    limit: number;
  };
  onFilterChange: (filters: { status?: string; therapist_id?: string }) => void;
}

export default function SessionFilters({ filters, onFilterChange }: SessionFiltersProps) {
  return (
    <div className="mb-4 flex gap-4 items-end">
      <div className="flex-1">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
          <option value="No Show">No Show</option>
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="therapist" className="block text-sm font-medium text-gray-700 mb-1">
          Therapist ID
        </label>
        <input
          id="therapist"
          type="number"
          value={filters.therapist_id || ''}
          onChange={(e) =>
            onFilterChange({ therapist_id: e.target.value || undefined })
          }
          placeholder="Filter by therapist ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {(filters.status || filters.therapist_id) && (
        <button
          onClick={() => onFilterChange({ status: undefined, therapist_id: undefined })}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

