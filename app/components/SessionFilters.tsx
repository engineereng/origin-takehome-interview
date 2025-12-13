'use client';

import { useState, useEffect } from 'react';
import { searchTherapists } from '@/lib/api';
import type { Therapist } from '@/lib/types';
import SearchableDropdown from './SearchableDropdown';

interface SessionFiltersProps {
  filters: {
    status?: string;
    therapist_id?: string;
    therapist_name?: string;
    page: number;
    limit: number;
  };
  onFilterChange: (filters: { status?: string; therapist_id?: string; therapist_name?: string }) => void;
}

export default function SessionFilters({ filters, onFilterChange }: SessionFiltersProps) {
  const [therapistSearch, setTherapistSearch] = useState(filters.therapist_name || '');

  // Sync local state with filters when they change externally
  useEffect(() => {
    setTherapistSearch(filters.therapist_name || '');
  }, [filters.therapist_name]);

  const handleTherapistSelect = (therapist: Therapist) => {
    setTherapistSearch(therapist.name);
    onFilterChange({ therapist_name: therapist.name, therapist_id: undefined });
  };

  const handleTherapistSearchChange = (value: string) => {
    setTherapistSearch(value);
    if (!value.trim()) {
      onFilterChange({ therapist_name: undefined, therapist_id: undefined });
    }
  };

  const handleClear = () => {
    setTherapistSearch('');
    onFilterChange({ status: undefined, therapist_id: undefined, therapist_name: undefined });
  };

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
        <SearchableDropdown<Therapist>
          id="therapist"
          label="Therapist"
          placeholder="Search by therapist name..."
          value={therapistSearch}
          onValueChange={handleTherapistSearchChange}
          onSelect={handleTherapistSelect}
          searchFunction={searchTherapists}
          renderItem={(therapist) => (
            <>
              <div className="font-medium">{therapist.name}</div>
              {therapist.specialty && (
                <div className="text-sm text-gray-500">{therapist.specialty}</div>
              )}
            </>
          )}
          hasSelection={!!(filters.therapist_name && therapistSearch === filters.therapist_name)}
          getKey={(therapist) => therapist.id}
        />
      </div>

      {(filters.status || filters.therapist_name) && (
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

