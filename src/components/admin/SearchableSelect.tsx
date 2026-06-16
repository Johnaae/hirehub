'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, Check } from 'lucide-react';

interface SearchableSelectProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  allowCustom?: boolean;
  onAddCustom?: (value: string) => Promise<void> | void;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search or select...',
  required,
  allowCustom,
  onAddCustom,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  const showAdd =
    allowCustom &&
    query.trim() &&
    !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  const select = (v: string) => {
    onChange(v);
    setQuery('');
    setOpen(false);
  };

  const addCustom = async () => {
    const v = query.trim();
    if (!v) return;
    if (onAddCustom) await onAddCustom(v);
    select(v);
  };

  return (
    <div className="ats-field" ref={ref}>
      {label && (
        <label className="ats-label">
          {label}
          {required && <span className="ats-required">*</span>}
        </label>
      )}
      <button
        type="button"
        className={`ats-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className={value ? '' : 'ats-placeholder'}>{value || placeholder}</span>
        <ChevronDown size={16} className={`ats-chevron ${open ? 'rotated' : ''}`} />
      </button>
      {open && (
        <div className="ats-dropdown">
          <div className="ats-dropdown-search">
            <Search size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              autoFocus
            />
          </div>
          <ul className="ats-dropdown-list">
            {filtered.length === 0 && !showAdd && (
              <li className="ats-dropdown-empty">No matches found</li>
            )}
            {filtered.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  className={`ats-dropdown-item ${value === opt ? 'selected' : ''}`}
                  onClick={() => select(opt)}
                >
                  {opt}
                  {value === opt && <Check size={14} />}
                </button>
              </li>
            ))}
            {showAdd && (
              <li>
                <button type="button" className="ats-dropdown-item add-new" onClick={addCustom}>
                  <Plus size={14} /> Add &quot;{query.trim()}&quot;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
