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
    date_from?: string;
    date_to?: string;
    page: number;
    limit: number;
  };
  onFilterChange: (filters: { status?: string; therapist_id?: string; therapist_name?: string; date_from?: string; date_to?: string }) => void;
}

export default function SessionFilters({ filters, onFilterChange }: SessionFiltersProps) {
  const [therapistSearch, setTherapistSearch] = useState(filters.therapist_name || '');
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // Sync local state with filters when they change externally
  useEffect(() => {
    setTherapistSearch(filters.therapist_name || '');
  }, [filters.therapist_name]);

  // Validate date range
  useEffect(() => {
    if (filters.date_from && filters.date_to) {
      const fromDate = new Date(filters.date_from);
      const toDate = new Date(filters.date_to);
      if (fromDate > toDate) {
        setDateRangeError('Date From must be before Date To');
      } else {
        setDateRangeError(null);
      }
    } else {
      setDateRangeError(null);
    }
  }, [filters.date_from, filters.date_to]);

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
    onFilterChange({ status: undefined, therapist_id: undefined, therapist_name: undefined, date_from: undefined, date_to: undefined });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Convert datetime-local format to ISO string for API
    const isoValue = value ? new Date(value).toISOString() : undefined;
    
    // Validate against date_to if it exists
    if (isoValue && filters.date_to) {
      const fromDate = new Date(isoValue);
      const toDate = new Date(filters.date_to);
      if (fromDate > toDate) {
        setDateRangeError('Date From must be before Date To');
      } else {
        setDateRangeError(null);
      }
    } else {
      setDateRangeError(null);
    }
    
    onFilterChange({ date_from: isoValue });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Convert datetime-local format to ISO string for API
    const isoValue = value ? new Date(value).toISOString() : undefined;
    
    // Validate against date_from if it exists
    if (isoValue && filters.date_from) {
      const fromDate = new Date(filters.date_from);
      const toDate = new Date(isoValue);
      if (fromDate > toDate) {
        setDateRangeError('Date From must be before Date To');
      } else {
        setDateRangeError(null);
      }
    } else {
      setDateRangeError(null);
    }
    
    onFilterChange({ date_to: isoValue });
  };

  return (
    <div className="mb-4">
      <div className="flex gap-4 items-end">
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

      <div className="flex-1">
        <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
          Date From
        </label>
        <input
          id="date_from"
          type="datetime-local"
          value={filters.date_from ? new Date(filters.date_from).toISOString().slice(0, 16) : ''}
          onChange={handleDateFromChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            dateRangeError
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          aria-invalid={dateRangeError ? 'true' : 'false'}
          aria-describedby={dateRangeError ? 'date-range-error' : undefined}
        />
      </div>

      <div className="flex-1">
        <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
          Date To
        </label>
        <input
          id="date_to"
          type="datetime-local"
          value={filters.date_to ? new Date(filters.date_to).toISOString().slice(0, 16) : ''}
          onChange={handleDateToChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            dateRangeError
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          aria-invalid={dateRangeError ? 'true' : 'false'}
          aria-describedby={dateRangeError ? 'date-range-error' : undefined}
        />
      </div>

      {(filters.status || filters.therapist_name || filters.date_from || filters.date_to) && (
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
      </div>
      {dateRangeError && (
        <div
          id="date-range-error"
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {dateRangeError}
        </div>
      )}
    </div>
  );
}

