/**
 * DateRangePicker Component
 * 
 * Componente para seleção de período com presets e modo customizado.
 */

import { useState } from 'react';
import { DatePreset, formatDateRangeLabel } from '../../dashboard/dateRange';

type DateRangePickerProps = {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
};

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last_7_days', label: 'Últimos 7 dias' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'this_quarter', label: 'Este trimestre' },
  { value: 'ytd', label: 'Ano até hoje' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = PRESETS.find(p => p.value === value)?.label || 'Últimos 30 dias';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    onChange(preset.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    value === preset.value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
