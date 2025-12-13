'use client';

import { useState } from 'react';
import { createSession, searchTherapists, searchPatients } from '@/lib/api';
import type { Therapist, Patient } from '@/lib/types';
import SearchableDropdown from './SearchableDropdown';

interface CreateSessionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSessionModal({ onClose, onSuccess }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    therapist_id: '',
    patient_id: '',
    date: '',
    status: 'Scheduled',
  });
  const [therapistSearch, setTherapistSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    therapist?: string;
    patient?: string;
  }>({});

  const handleTherapistSelect = (therapist: Therapist) => {
    setFormData({ ...formData, therapist_id: therapist.id.toString() });
    setTherapistSearch(therapist.name);
    setFieldErrors((prev) => ({ ...prev, therapist: undefined }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData({ ...formData, patient_id: patient.id.toString() });
    setPatientSearch(patient.name);
    setFieldErrors((prev) => ({ ...prev, patient: undefined }));
  };

  const handleTherapistSearchChange = (value: string) => {
    setTherapistSearch(value);
    setFormData({ ...formData, therapist_id: '' });
    if (fieldErrors.therapist) {
      setFieldErrors((prev) => ({ ...prev, therapist: undefined }));
    }
  };

  const handlePatientSearchChange = (value: string) => {
    setPatientSearch(value);
    setFormData({ ...formData, patient_id: '' });
    if (fieldErrors.patient) {
      setFieldErrors((prev) => ({ ...prev, patient: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const errors: { therapist?: string; patient?: string } = {};
    if (!formData.therapist_id) {
      if (therapistSearch.trim()) {
        errors.therapist = 'Please select a therapist from the dropdown';
      } else {
        errors.therapist = 'Please search for and select a therapist';
      }
    }
    if (!formData.patient_id) {
      if (patientSearch.trim()) {
        errors.patient = 'Please select a patient from the dropdown';
      } else {
        errors.patient = 'Please search for and select a patient';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please select both a therapist and a patient');
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await createSession({
        therapist_id: parseInt(formData.therapist_id, 10),
        patient_id: parseInt(formData.patient_id, 10),
        date: new Date(formData.date).toISOString(),
        status: formData.status as any,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableDropdown<Therapist>
            id="therapist"
            label="Therapist"
            placeholder="Search for a therapist..."
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
            hasSelection={!!formData.therapist_id}
            error={fieldErrors.therapist}
            required
            getKey={(therapist) => therapist.id}
          />

          <SearchableDropdown<Patient>
            id="patient"
            label="Patient"
            placeholder="Search for a patient..."
            value={patientSearch}
            onValueChange={handlePatientSearchChange}
            onSelect={handlePatientSelect}
            searchFunction={searchPatients}
            renderItem={(patient) => (
              <>
                <div className="font-medium">{patient.name}</div>
                {patient.dob && (
                  <div className="text-sm text-gray-500">
                    DOB: {new Date(patient.dob).toLocaleDateString()}
                  </div>
                )}
              </>
            )}
            hasSelection={!!formData.patient_id}
            error={fieldErrors.patient}
            required
            getKey={(patient) => patient.id}
          />

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

