import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatPrice, formatShortDate, getDiscountedPrice } from '../services/api';
import type { EventItem } from '../types';
import { imageUrl, imageObjectPosition } from '../utils/imageUrl';
import './EventCard.css';

interface EventCardProps {
  event: EventItem;
  index?: number;
  variant?: string;
}

export default function EventCard({ event, index = 0, variant = 'default' }: EventCardProps) {
  const hasDiscount = event.discount > 0 && event.price > 0;
  const discounted = getDiscountedPrice(event.price, event.discount);

  return (
    <motion.article
      className={`event-card event-card--${variant}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/evento/${event.id}`} className="event-card__link">
        <div className="event-card__image-wrap">
          <img
            src={imageUrl(event.image, 'card')}
            alt={event.title}
            className="event-card__image"
            loading="lazy"
            style={{ objectPosition: imageObjectPosition({ x: event.imageFocusX, y: event.imageFocusY }) }}
          />
          <div className="event-card__overlay" />
          <div className="event-card__date-badge">
            <span className="event-card__date-day">{formatShortDate(event.date).split(' ')[0]}</span>
            <span className="event-card__date-month">{formatShortDate(event.date).split(' ')[1]}</span>
          </div>
          {event.featured && <span className="event-card__featured">Destacado</span>}
          {hasDiscount && <span className="event-card__discount">-{event.discount}%</span>}
        </div>

        <div className="event-card__body">
          <span className="event-card__category">{event.category}</span>
          <h3 className="event-card__title">{event.title}</h3>
          <p className="event-card__artist">{event.artist}</p>
          <div className="event-card__meta">
            <span className="event-card__venue">{event.city} · {event.venue}</span>
            <span className="event-card__price">
              {hasDiscount && <span className="event-card__price-old">{formatPrice(event.price)} </span>}
              {formatPrice(discounted)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
