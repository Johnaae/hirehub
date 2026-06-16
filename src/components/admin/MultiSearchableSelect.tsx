'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';

interface MultiSearchableSelectProps {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  onAddCustom?: (value: string) => Promise<void> | void;
}

export default function MultiSearchableSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Search and add items...',
  onAddCustom,
}: MultiSearchableSelectProps) {
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

  const available = options.filter(
    (o) => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase())
  );

  const showAdd =
    query.trim() &&
    !selected.some((s) => s.toLowerCase() === query.trim().toLowerCase()) &&
    !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  const add = async (item: string) => {
    if (!selected.includes(item)) onChange([...selected, item]);
    setQuery('');
    if (onAddCustom && !options.includes(item)) await onAddCustom(item);
  };

  const remove = (item: string) => onChange(selected.filter((s) => s !== item));

  return (
    <div className="ats-field" ref={ref}>
      {label && <label className="ats-label">{label}</label>}
      <div className="ats-tags-wrap">
        {selected.map((item) => (
          <span key={item} className="ats-tag">
            {item}
            <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <button type="button" className="ats-tags-add" onClick={() => setOpen(!open)}>
          <Plus size={14} /> Add
        </button>
      </div>
      {open && (
        <div className="ats-dropdown ats-dropdown-multi">
          <div className="ats-dropdown-search">
            <Search size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <ul className="ats-dropdown-list">
            {available.map((opt) => (
              <li key={opt}>
                <button type="button" className="ats-dropdown-item" onClick={() => add(opt)}>
                  <Plus size={14} /> {opt}
                </button>
              </li>
            ))}
            {showAdd && (
              <li>
                <button type="button" className="ats-dropdown-item add-new" onClick={() => add(query.trim())}>
                  <Plus size={14} /> Add &quot;{query.trim()}&quot;
                </button>
              </li>
            )}
            {available.length === 0 && !showAdd && (
              <li className="ats-dropdown-empty">No more options</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
