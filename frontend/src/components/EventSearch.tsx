import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories, fetchCities } from '../services/api';
import type { City } from '../types';
import CalendarDatePicker from './CalendarDatePicker';
import './EventSearch.css';

interface SearchFilters {
  artist: string;
  city: string;
  category: string;
  date: string;
}

interface EventSearchProps {
  variant?: string;
  initialFilters?: Partial<SearchFilters>;
  onSearch?: (filters: Record<string, string>) => void;
}

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  id: string;
  name: 'city' | 'category';
  value: string;
  placeholder: string;
  options: FilterSelectOption[];
  isOpen: boolean;
  onToggle: (name: 'city' | 'category') => void;
  onChange: (value: string) => void;
}

const emptyFilters: SearchFilters = {
  artist: '',
  city: '',
  category: '',
  date: ''
};

function FilterSelect({
  id,
  name,
  value,
  placeholder,
  options,
  isOpen,
  onToggle,
  onChange
}: FilterSelectProps) {
  const selectedLabel = options.find(option => option.value === value)?.label || placeholder;

  return (
    <div className={`event-search__select ${isOpen ? 'event-search__select--open' : ''}`}>
      <button
        id={id}
        type="button"
        className="event-search__select-trigger"
        onClick={() => onToggle(name)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="event-search__select-menu" role="listbox" aria-labelledby={id}>
          {options.map(option => {
            const active = option.value === value;
            return (
              <button
                key={`${name}-${option.value || 'all'}`}
                type="button"
                className={`event-search__select-option ${
                  active ? 'event-search__select-option--active' : ''
                }`}
                onClick={() => onChange(option.value)}
                role="option"
                aria-selected={active}
              >
                <span>{option.label}</span>
                {active && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EventSearch({
  variant = 'bar',
  initialFilters = {},
  onSearch
}: EventSearchProps) {
  const searchRef = useRef<HTMLFormElement>(null);
  const [filters, setFilters] = useState<SearchFilters>({ ...emptyFilters, ...initialFilters });
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [openSelect, setOpenSelect] = useState<'city' | 'category' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpenSelect(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSelect(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchCities()])
      .then(([cats, cityList]) => {
        setCategories(cats);
        setCities(cityList);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters.artist, initialFilters.city, initialFilters.category, initialFilters.date]);

  const handleChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: 'city' | 'category', value: string) => {
    handleChange(field, value);
    setOpenSelect(null);
  };

  const buildParams = (f: SearchFilters) => {
    const params = new URLSearchParams();
    if (f.artist.trim()) params.set('artist', f.artist.trim());
    if (f.city) params.set('city', f.city);
    if (f.category) params.set('category', f.category);
    if (f.date) params.set('date', f.date);
    return params;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = buildParams(filters);

    if (onSearch) {
      onSearch(Object.fromEntries(params));
      return;
    }

    const query = params.toString();
    navigate(`/eventos${query ? `?${query}` : ''}`);
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    setOpenSelect(null);
    if (onSearch) {
      onSearch({});
    } else {
      navigate('/eventos');
    }
  };

  const hasFilters = Object.values(filters).some(v => v);
  const cityOptions = [
    { value: '', label: 'Todas las ciudades' },
    ...cities.map(c => ({ value: c.name, label: c.name }))
  ];
  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  return (
    <motion.form
      ref={searchRef}
      className={`event-search event-search--${variant}`}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="event-search__fields">
        <div className="event-search__field">
          <label htmlFor="search-artist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            Artista
          </label>
          <input
            id="search-artist"
            type="text"
            placeholder="Ej: Karol G, Shakira..."
            value={filters.artist}
            onChange={(e) => handleChange('artist', e.target.value)}
          />
        </div>

        <div className="event-search__field">
          <label htmlFor="search-city">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Ciudad
          </label>
          <FilterSelect
            id="search-city"
            name="city"
            value={filters.city}
            placeholder="Todas las ciudades"
            options={cityOptions}
            isOpen={openSelect === 'city'}
            onToggle={(name) => setOpenSelect(current => (current === name ? null : name))}
            onChange={(value) => handleSelectChange('city', value)}
          />
        </div>

        <div className="event-search__field">
          <label htmlFor="search-category">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h7"/>
            </svg>
            Categoría
          </label>
          <FilterSelect
            id="search-category"
            name="category"
            value={filters.category}
            placeholder="Todas las categorías"
            options={categoryOptions}
            isOpen={openSelect === 'category'}
            onToggle={(name) => setOpenSelect(current => (current === name ? null : name))}
            onChange={(value) => handleSelectChange('category', value)}
          />
        </div>

        <div className="event-search__field">
          <label htmlFor="search-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Fecha
          </label>
          <CalendarDatePicker
            id="search-date"
            value={filters.date}
            variant="embedded"
            placeholder="dd/mm/aaaa"
            onOpen={() => setOpenSelect(null)}
            onChange={(value) => handleChange('date', value)}
          />
        </div>
      </div>

      <div className="event-search__actions">
        <button type="submit" className="btn btn-primary event-search__submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Buscar eventos
        </button>
        <button
          type="button"
          className="btn btn-outline event-search__clear"
          onClick={handleClear}
          disabled={!hasFilters}
        >
          Limpiar
        </button>
      </div>
    </motion.form>
  );
}
