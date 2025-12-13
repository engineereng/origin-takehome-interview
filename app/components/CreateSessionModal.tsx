'use client';

import { useState, useEffect, useRef } from 'react';
import { createSession, searchTherapists, searchPatients } from '@/lib/api';
import type { Therapist, Patient } from '@/lib/types';

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
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showTherapistDropdown, setShowTherapistDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    therapist?: string;
    patient?: string;
  }>({});
  const therapistRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (therapistRef.current && !therapistRef.current.contains(event.target as Node)) {
        setShowTherapistDropdown(false);
      }
      if (patientRef.current && !patientRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTherapists = async () => {
      // Don't search if we already have a valid selection
      if (formData.therapist_id) {
        setTherapists([]);
        setShowTherapistDropdown(false);
        return;
      }

      if (therapistSearch.trim()) {
        try {
          const results = await searchTherapists(therapistSearch);
          setTherapists(results);
          setShowTherapistDropdown(true);
          // Clear error if results found and user selects
          if (results.length > 0 && fieldErrors.therapist) {
            setFieldErrors((prev) => ({ ...prev, therapist: undefined }));
          }
        } catch (err) {
          console.error('Error searching therapists:', err);
        }
      } else {
        setTherapists([]);
        setShowTherapistDropdown(false);
      }
    };

    const timeoutId = setTimeout(fetchTherapists, 300);
    return () => clearTimeout(timeoutId);
  }, [therapistSearch, formData.therapist_id, fieldErrors.therapist]);

  useEffect(() => {
    const fetchPatients = async () => {
      // Don't search if we already have a valid selection
      if (formData.patient_id) {
        setPatients([]);
        setShowPatientDropdown(false);
        return;
      }

      if (patientSearch.trim()) {
        try {
          const results = await searchPatients(patientSearch);
          setPatients(results);
          setShowPatientDropdown(true);
          // Clear error if results found and user selects
          if (results.length > 0 && fieldErrors.patient) {
            setFieldErrors((prev) => ({ ...prev, patient: undefined }));
          }
        } catch (err) {
          console.error('Error searching patients:', err);
        }
      } else {
        setPatients([]);
        setShowPatientDropdown(false);
      }
    };

    const timeoutId = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timeoutId);
  }, [patientSearch, formData.patient_id, fieldErrors.patient]);

  const handleTherapistSelect = (therapist: Therapist) => {
    setFormData({ ...formData, therapist_id: therapist.id.toString() });
    setTherapistSearch(therapist.name);
    setShowTherapistDropdown(false);
    setFieldErrors((prev) => ({ ...prev, therapist: undefined }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData({ ...formData, patient_id: patient.id.toString() });
    setPatientSearch(patient.name);
    setShowPatientDropdown(false);
    setFieldErrors((prev) => ({ ...prev, patient: undefined }));
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
          <div ref={therapistRef} className="relative">
            <label htmlFor="therapist" className="block text-sm font-medium text-gray-700 mb-1">
              Therapist <span className="text-red-500">*</span>
            </label>
            <input
              id="therapist"
              type="text"
              required
              value={therapistSearch}
              onChange={(e) => {
                setTherapistSearch(e.target.value);
                setFormData({ ...formData, therapist_id: '' });
                if (fieldErrors.therapist) {
                  setFieldErrors((prev) => ({ ...prev, therapist: undefined }));
                }
              }}
              onFocus={() => {
                if (therapistSearch.trim()) {
                  setShowTherapistDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow dropdown click to register
                setTimeout(() => setShowTherapistDropdown(false), 200);
              }}
              placeholder="Search for a therapist..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.therapist
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {fieldErrors.therapist && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.therapist}</p>
            )}
            {showTherapistDropdown && therapists.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {therapists.map((therapist) => (
                  <button
                    key={therapist.id}
                    type="button"
                    onClick={() => handleTherapistSelect(therapist)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium">{therapist.name}</div>
                    {therapist.specialty && (
                      <div className="text-sm text-gray-500">{therapist.specialty}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {showTherapistDropdown && therapistSearch.trim() && therapists.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-gray-500">
                No therapists found. Please try a different search term.
              </div>
            )}
            {formData.therapist_id && !therapistSearch && (
              <input type="hidden" value={formData.therapist_id} />
            )}
          </div>

          <div ref={patientRef} className="relative">
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
              Patient <span className="text-red-500">*</span>
            </label>
            <input
              id="patient"
              type="text"
              required
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setFormData({ ...formData, patient_id: '' });
                if (fieldErrors.patient) {
                  setFieldErrors((prev) => ({ ...prev, patient: undefined }));
                }
              }}
              onFocus={() => {
                if (patientSearch.trim()) {
                  setShowPatientDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow dropdown click to register
                setTimeout(() => setShowPatientDropdown(false), 200);
              }}
              placeholder="Search for a patient..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.patient
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {fieldErrors.patient && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.patient}</p>
            )}
            {showPatientDropdown && patients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium">{patient.name}</div>
                    {patient.dob && (
                      <div className="text-sm text-gray-500">
                        DOB: {new Date(patient.dob).toLocaleDateString()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {showPatientDropdown && patientSearch.trim() && patients.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-gray-500">
                No patients found. Please try a different search term.
              </div>
            )}
            {formData.patient_id && !patientSearch && (
              <input type="hidden" value={formData.patient_id} />
            )}
          </div>

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

