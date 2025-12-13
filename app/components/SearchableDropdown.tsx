'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchableDropdownProps<T> {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (item: T) => void;
  searchFunction: (search: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  hasSelection: boolean;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
  getKey?: (item: T) => string | number;
}

export default function SearchableDropdown<T>({
  label,
  placeholder,
  value,
  onValueChange,
  onSelect,
  searchFunction,
  renderItem,
  hasSelection,
  error,
  required = false,
  id,
  className = '',
  getKey,
}: SearchableDropdownProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      // Don't search if we already have a valid selection
      if (hasSelection) {
        setItems([]);
        setShowDropdown(false);
        return;
      }

      if (value.trim()) {
        try {
          const results = await searchFunction(value);
          setItems(results);
          setShowDropdown(true);
        } catch (err) {
          console.error('Error searching:', err);
        }
      } else {
        setItems([]);
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(fetchItems, 300);
    return () => clearTimeout(timeoutId);
  }, [value, hasSelection, searchFunction]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setShowDropdown(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => {
          if (value.trim() && !hasSelection) {
            setShowDropdown(true);
          }
        }}
        onBlur={() => {
          // Delay to allow dropdown click to register
          setTimeout(() => setShowDropdown(false), 200);
        }}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {showDropdown && items.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {items.map((item, index) => (
            <button
              key={getKey ? getKey(item) : index}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}
      {showDropdown && value.trim() && items.length === 0 && !hasSelection && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-gray-500">
          No results found. Please try a different search term.
        </div>
      )}
    </div>
  );
}
