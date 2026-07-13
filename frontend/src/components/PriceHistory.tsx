import { useEffect, useState } from 'react';
import { fetchPriceHistory, formatPrice } from '../services/api';
import type { PriceHistoryEntry } from '../types';
import './PriceHistory.css';

interface PriceHistoryProps {
  eventId: number;
}

export default function PriceHistory({ eventId }: PriceHistoryProps) {
  const [entries, setEntries] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceHistory(eventId)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return null;
  if (entries.length === 0) return null;

  return (
    <section className="price-history">
      <h3>Historial de precio</h3>
      <ul className="price-history__list">
        {entries.map((entry) => (
          <li key={entry.id} className="price-history__item">
            <span className="price-history__date">
              {new Date(entry.createdAt).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="price-history__change">
              {formatPrice(entry.oldPrice)} → {formatPrice(entry.newPrice)}
            </span>
            {entry.reason && <p className="price-history__reason">{entry.reason}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
