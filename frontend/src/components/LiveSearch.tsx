import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEventSearchStream } from '../hooks/useEventSearchStream';
import { formatShortDate, formatPrice } from '../services/api';
import { imageUrl } from '../utils/imageUrl';
import './LiveSearch.css';

export default function LiveSearch() {
  const { term, results, loading, search, clear } = useEventSearchStream();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
    setOpen(true);
  };

  const handleSelect = () => {
    clear();
    setOpen(false);
  };

  const showPanel = open && term.trim().length >= 2;

  return (
    <div className="live-search" ref={containerRef}>
      <div className="live-search__input-wrap">
        <svg className="live-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="live-search__input"
          placeholder="Búsqueda instantánea: artista, evento, ciudad..."
          value={term}
          onChange={handleChange}
          onFocus={() => term.trim().length >= 2 && setOpen(true)}
        />
        {term && (
          <button type="button" className="live-search__clear" onClick={clear} aria-label="Limpiar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="live-search__panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <div className="live-search__status">Buscando...</div>
            ) : results.length === 0 ? (
              <div className="live-search__status">Sin resultados para “{term.trim()}”</div>
            ) : (
              <ul className="live-search__results">
                {results.slice(0, 6).map((event) => (
                  <li key={event.id}>
                    <Link to={`/evento/${event.id}`} className="live-search__result" onClick={handleSelect}>
                      <img src={imageUrl(event.image, 'thumb')} alt="" className="live-search__result-img" />
                      <div className="live-search__result-info">
                        <span className="live-search__result-title">{event.title}</span>
                        <span className="live-search__result-meta">
                          {event.artist} · {event.city}
                        </span>
                      </div>
                      <div className="live-search__result-side">
                        <span className="live-search__result-date">{formatShortDate(event.date)}</span>
                        <span className="live-search__result-price">{formatPrice(event.price)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
