'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
}

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  className,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input-wrap ${className || ''}`}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
