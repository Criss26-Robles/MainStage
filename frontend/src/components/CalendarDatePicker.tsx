import { useEffect, useMemo, useRef, useState } from 'react';
import './CalendarDatePicker.css';

interface CalendarDatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onOpen?: () => void;
  placeholder?: string;
  variant?: 'embedded' | 'field';
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const WEEKDAYS = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  const date = parseDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date).replace('.', '');
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

export default function CalendarDatePicker({
  id,
  value,
  onChange,
  onOpen,
  placeholder = 'dd/mm/aaaa',
  variant = 'field'
}: CalendarDatePickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const days = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const todayValue = toDateValue(new Date());
  const selectedValue = selectedDate ? toDateValue(selectedDate) : '';
  const displayValue = formatDisplayDate(value);

  const changeMonth = (amount: number) => {
    setViewDate(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const handleSelect = (date: Date) => {
    onChange(toDateValue(date));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(toDateValue(today));
    setViewDate(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={`date-picker date-picker--${variant} ${isOpen ? 'date-picker--open' : ''}`} ref={pickerRef}>
      <button
        id={id}
        type="button"
        className="date-picker__trigger"
        onClick={() => {
          setIsOpen(current => {
            if (!current) onOpen?.();
            return !current;
          });
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className={displayValue ? 'date-picker__value' : 'date-picker__placeholder'}>
          {displayValue || placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="date-picker__panel" role="dialog" aria-label="Seleccionar fecha">
          <div className="date-picker__header">
            <button type="button" className="date-picker__nav" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="date-picker__month">
              <strong>{MONTHS[viewDate.getMonth()]}</strong>
              <span>{viewDate.getFullYear()}</span>
            </div>
            <button type="button" className="date-picker__nav" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="date-picker__weekdays">
            {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
          </div>

          <div className="date-picker__grid">
            {days.map(date => {
              const dateValue = toDateValue(date);
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = dateValue === selectedValue;
              const isToday = dateValue === todayValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  className={`date-picker__day ${!isCurrentMonth ? 'date-picker__day--muted' : ''} ${
                    isToday ? 'date-picker__day--today' : ''
                  } ${isSelected ? 'date-picker__day--selected' : ''}`}
                  onClick={() => handleSelect(date)}
                  aria-pressed={isSelected}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker__footer">
            <button type="button" onClick={handleClear}>Borrar</button>
            <button type="button" onClick={handleToday}>Hoy</button>
          </div>
        </div>
      )}
    </div>
  );
}
