import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import EventCard from '../components/EventCard';
import { formatDate } from '../services/api';
import { loadEvents } from '../store/eventsSlice';
import type { EventFilters } from '../types';
import './Events.css';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const loading = useAppSelector(
    (state) => state.events.status === 'loading' || state.events.status === 'idle'
  );

  const filters = {
    artist: searchParams.get('artist') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    date: searchParams.get('date') || ''
  };

  const hasFilters = Object.values(filters).some(v => v);

  useEffect(() => {
    const params: EventFilters = {};
    if (filters.artist) params.artist = filters.artist;
    if (filters.city) params.city = filters.city;
    if (filters.category) params.category = filters.category;
    if (filters.date) params.date = filters.date;
    dispatch(loadEvents(params));
  }, [dispatch, filters.artist, filters.city, filters.category, filters.date]);

  const handleSearch = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    if (newFilters.artist) params.set('artist', newFilters.artist);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.date) params.set('date', newFilters.date);
    setSearchParams(params);
  };

  const buildSubtitle = () => {
    const parts = [];
    if (filters.city) parts.push(filters.city);
    if (filters.category) parts.push(filters.category);
    if (filters.artist) parts.push(`"${filters.artist}"`);
    if (filters.date) parts.push(formatDate(filters.date));
    if (parts.length === 0) return 'Encuentra tu próximo plan en cualquier ciudad de Colombia';
    return `Resultados: ${parts.join(' · ')}`;
  };

  return (
    <div className="events-page">
      <div className="events-page__header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label">Catálogo nacional</p>
            <h1 className="section-title">Buscar eventos</h1>
            <p className="events-page__subtitle">{buildSubtitle()}</p>
          </motion.div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="events-page__grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="events-page__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>No se encontraron eventos con esos criterios</p>
            {hasFilters && (
              <button className="btn btn-outline" onClick={() => handleSearch({})}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="events-page__results">
              {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
            </p>
            <div className="events-page__grid">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
