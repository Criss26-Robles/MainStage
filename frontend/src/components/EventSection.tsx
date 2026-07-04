import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PopularEventCard from './PopularEventCard';
import type { EventItem } from '../types';
import './EventSection.css';

interface EventSectionProps {
  id?: string;
  label?: string;
  title: string;
  events: EventItem[];
  layout?: string;
  viewAllLink?: string;
  loading?: boolean;
}

export default function EventSection({
  id,
  label,
  title,
  events,
  layout = 'vertical',
  viewAllLink,
  loading = false
}: EventSectionProps) {
  if (!loading && events.length === 0) return null;

  return (
    <section id={id} className="event-section">
      <div className="container">
        <motion.div
          className="event-section__header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div>
            {label && <p className="section-label">{label}</p>}
            <h2 className="section-title">{title}</h2>
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="btn btn-ghost event-section__link">
              Ver todos
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className={`event-section__grid event-section__grid--${layout}`}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className={`event-section__grid event-section__grid--${layout}`}>
            {events.map((event, i) => (
              <PopularEventCard key={event.id} event={event} index={i} layout={layout} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
