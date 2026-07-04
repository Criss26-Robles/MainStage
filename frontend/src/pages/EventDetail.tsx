import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TicketForm from '../components/TicketForm';
import { fetchEvent, formatDate, formatPrice } from '../services/api';
import type { EventItem } from '../types';
import { heroImageProps } from '../utils/imageUrl';
import './EventDetail.css';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchEvent(id)
      .then(setEvent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="event-detail event-detail--loading">
        <div className="container">
          <div className="event-detail__skeleton" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail event-detail--error">
        <div className="container">
          <h1>Evento no encontrado</h1>
          <Link to="/eventos" className="btn btn-primary">Ver eventos</Link>
        </div>
      </div>
    );
  }

  const heroImage = heroImageProps(event.image, {
    x: event.imageFocusX,
    y: event.imageFocusY
  });

  return (
    <div className="event-detail">
      <div className="event-detail__hero">
        <img
          {...heroImage}
          alt={event.title}
          className="event-detail__hero-img"
          decoding="async"
        />
        <div className="event-detail__hero-overlay" />
      </div>

      <div className="container event-detail__content">
        <motion.div
          className="event-detail__info"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/eventos" className="event-detail__back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver a eventos
          </Link>

          <div className="event-detail__tags">
            <span className="event-detail__tag">{event.category}</span>
            {event.tags.map(tag => (
              <span key={tag} className="event-detail__tag event-detail__tag--sub">{tag}</span>
            ))}
          </div>

          <h1 className="event-detail__title">{event.title}</h1>
          <p className="event-detail__artist">{event.artist}</p>

          <div className="event-detail__meta-grid">
            <div className="event-detail__meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <div>
                <span className="event-detail__meta-label">Fecha</span>
                <span>{formatDate(event.date)}</span>
              </div>
            </div>
            <div className="event-detail__meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <div>
                <span className="event-detail__meta-label">Hora</span>
                <span>{event.time}</span>
              </div>
            </div>
            <div className="event-detail__meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <span className="event-detail__meta-label">Lugar</span>
                <span>{event.venue}, {event.city} · {event.department}</span>
              </div>
            </div>
            <div className="event-detail__meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              <div>
                <span className="event-detail__meta-label">Desde</span>
                <span className="event-detail__meta-price">{formatPrice(event.price)}</span>
              </div>
            </div>
          </div>

          <div className="event-detail__description">
            <h2>Acerca del evento</h2>
            <p>{event.description}</p>
          </div>
        </motion.div>

        <motion.div
          className="event-detail__sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TicketForm event={event} />
        </motion.div>
      </div>
    </div>
  );
}
