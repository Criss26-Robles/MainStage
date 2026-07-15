import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addFavorite, fetchFavoriteIds, removeFavorite } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  eventId: number;
  className?: string;
}

export default function FavoriteButton({ eventId, className = '' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setActive(false);
      return;
    }

    fetchFavoriteIds()
      .then((ids) => {
        if (!cancelled) setActive(ids.includes(eventId));
      })
      .catch(() => {
        if (!cancelled) setActive(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, isAuthenticated]);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    try {
      if (active) {
        await removeFavorite(eventId);
        setActive(false);
      } else {
        await addFavorite(eventId);
        setActive(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`favorite-button ${active ? 'favorite-button--active' : ''} ${className}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={active}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
        />
      </svg>
      <span>{active ? 'Guardado' : 'Guardar'}</span>
    </button>
  );
}
