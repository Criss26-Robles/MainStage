import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories, fetchCities } from '../services/api';
import './EventSearch.css';

const emptyFilters = {
  artist: '',
  city: '',
  category: '',
  date: ''
};

export default function EventSearch({ variant = 'bar', initialFilters = {}, onSearch }) {
  const [filters, setFilters] = useState({ ...emptyFilters, ...initialFilters });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

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

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const buildParams = (f) => {
    const params = new URLSearchParams();
    if (f.artist.trim()) params.set('artist', f.artist.trim());
    if (f.city) params.set('city', f.city);
    if (f.category) params.set('category', f.category);
    if (f.date) params.set('date', f.date);
    return params;
  };

  const handleSubmit = (e) => {
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
    if (onSearch) {
      onSearch({});
    } else {
      navigate('/eventos');
    }
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <motion.form
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
          <select
            id="search-city"
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {cities.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="event-search__field">
          <label htmlFor="search-category">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h7"/>
            </svg>
            Categoría
          </label>
          <select
            id="search-category"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="event-search__field">
          <label htmlFor="search-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Fecha
          </label>
          <input
            id="search-date"
            type="date"
            value={filters.date}
            onChange={(e) => handleChange('date', e.target.value)}
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
        {hasFilters && (
          <button type="button" className="btn btn-outline event-search__clear" onClick={handleClear}>
            Limpiar
          </button>
        )}
      </div>
    </motion.form>
  );
}
