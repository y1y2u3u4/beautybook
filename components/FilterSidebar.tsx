'use client';

import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSection {
  title: string;
  options: { label: string; value: string; count?: number }[];
}

export default function FilterSidebar() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['specialty', 'rating', 'availability'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const specialties = [
    { label: 'Facial Treatments', value: 'facial', count: 124 },
    { label: 'Hair Styling', value: 'hair', count: 98 },
    { label: 'Massage Therapy', value: 'massage', count: 76 },
    { label: 'Nail Services', value: 'nails', count: 65 },
    { label: 'Makeup Artistry', value: 'makeup', count: 54 },
    { label: 'Skin Care', value: 'skincare', count: 89 },
  ];

  const ratings = [
    { label: '4.5+ Stars', value: '4.5', count: 156 },
    { label: '4.0+ Stars', value: '4.0', count: 234 },
    { label: '3.5+ Stars', value: '3.5', count: 312 },
  ];

  const availability = [
    { label: 'Available Today', value: 'today', count: 23 },
    { label: 'Available This Week', value: 'week', count: 145 },
    { label: 'Available This Month', value: 'month', count: 287 },
  ];

  const insurance = [
    { label: 'Aetna', value: 'aetna' },
    { label: 'Blue Cross Blue Shield', value: 'bcbs' },
    { label: 'Cigna', value: 'cigna' },
    { label: 'UnitedHealth', value: 'united' },
  ];

  const renderSection = (
    id: string,
    title: string,
    options: { label: string; value: string; count?: number }[]
  ) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border-b border-neutral-200 last:border-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-left hover:text-primary-600 transition-colors"
        >
          <span className="font-semibold text-neutral-900">{title}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </button>

        {isExpanded && (
          <div className="pb-4 space-y-3">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="flex-1 text-sm text-neutral-700 group-hover:text-primary-600">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="text-sm text-neutral-400">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-neutral-600" />
        <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
      </div>

      <div className="space-y-0">
        {renderSection('specialty', 'Specialty', specialties)}
        {renderSection('rating', 'Rating', ratings)}
        {renderSection('availability', 'Availability', availability)}
        {renderSection('insurance', 'Insurance', insurance)}
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <h3 className="font-semibold text-neutral-900 mb-3">Distance</h3>
        <input
          type="range"
          min="1"
          max="50"
          defaultValue="10"
          className="w-full"
        />
        <div className="flex justify-between text-sm text-neutral-600 mt-2">
          <span>1 mile</span>
          <span>50 miles</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <h3 className="font-semibold text-neutral-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="500"
            defaultValue="250"
            className="w-full"
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min"
              className="input-field text-sm py-2"
            />
            <input
              type="number"
              placeholder="Max"
              className="input-field text-sm py-2"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">Verified providers only</span>
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 btn-secondary py-2 text-sm">
          Clear All
        </button>
        <button className="flex-1 btn-primary py-2 text-sm">
          Apply
        </button>
      </div>
    </div>
  );
}
