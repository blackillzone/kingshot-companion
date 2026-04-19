import { type ReactNode, useState, useEffect } from 'react';
import clsx from 'clsx';

interface Props {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  row?: boolean;
}

export function Field({ label, hint, children, className, row }: Props) {
  return (
    <div className={clsx(row ? 'flex items-center gap-3' : 'flex flex-col gap-1', className)}>
      <label className={clsx('text-xs font-medium text-gray-400 whitespace-nowrap', row && 'w-28 shrink-0')}>
        {label}
        {hint && (
          <span className="ml-1 text-gray-600 cursor-help" title={hint}>ⓘ</span>
        )}
      </label>
      {children}
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function NumberInput({ value, onChange, min = 0, max, step = 1, suffix, className }: NumberInputProps) {
  const [display, setDisplay] = useState(String(value));

  // Sync display when external value changes (e.g. profile switch)
  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  function commit(raw: string) {
    const v = parseFloat(raw);
    if (!Number.isNaN(v)) {
      const clamped = Math.min(max ?? Infinity, Math.max(min, v));
      onChange(clamped);
      setDisplay(String(clamped));
    } else {
      // Revert to last valid value
      setDisplay(String(value));
    }
  }

  return (
    <div className={clsx('flex items-center rounded-lg bg-gray-800 border border-gray-700 focus-within:border-orange-500 transition-colors', className)}>
      <input
        type="number"
        value={display}
        min={min}
        max={max}
        step={step}
        onChange={e => setDisplay(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit((e.target as HTMLInputElement).value); }}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none min-w-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="pr-3 text-xs text-gray-500 shrink-0">{suffix}</span>
      )}
    </div>
  );
}

interface SelectProps<T extends string | number> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

export function Select<T extends string | number>({ value, onChange, options, className }: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={e => {
        const raw = e.target.value;
        const parsed = typeof value === 'number' ? (Number(raw) as T) : (raw as T);
        onChange(parsed);
      }}
      className={clsx(
        'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none',
        'focus:border-orange-500 transition-colors cursor-pointer',
        className
      )}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, icon, children, className }: SectionCardProps) {
  return (
    <div className={clsx('bg-gray-900 border border-gray-800 rounded-xl', className)}>
      <div className="overflow-hidden rounded-t-xl flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900/80">
        {icon && <span className="text-orange-400">{icon}</span>}
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'orange' | 'blue' | 'purple' | 'green' | 'gray';
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors = {
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    gray: 'bg-gray-700 text-gray-300 border-gray-600',
  };
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', colors[color])}>
      {children}
    </span>
  );
}
