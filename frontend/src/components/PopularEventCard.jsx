import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate, getDiscountedPrice } from '../services/api';
import './PopularEventCard.css';

export default function PopularEventCard({ event, index = 0, layout = 'horizontal' }) {
  const discounted = getDiscountedPrice(event.price, event.discount);
  const hasDiscount = event.discount > 0 && event.price > 0;

  return (
    <motion.article
      className={`popular-card popular-card--${layout}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/evento/${event.id}`} className="popular-card__link">
        <div className="popular-card__image-wrap">
          <img src={event.image} alt={event.title} className="popular-card__image" loading="lazy" />
          <div className="popular-card__overlay" />
          {hasDiscount && (
            <span className="popular-card__discount">-{event.discount}%</span>
          )}
          {event.price === 0 && (
            <span className="popular-card__discount popular-card__discount--free">Gratis</span>
          )}
        </div>

        <div className="popular-card__body">
          <span className="popular-card__category">{event.category}</span>
          <h3 className="popular-card__title">{event.title}</h3>
          <p className="popular-card__artist">{event.artist}</p>

          <div className="popular-card__details">
            <div className="popular-card__detail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="popular-card__detail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
          </div>

          <div className="popular-card__pricing">
            {hasDiscount && (
              <span className="popular-card__price-old">{formatPrice(event.price)}</span>
            )}
            <span className="popular-card__price">{formatPrice(discounted)}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
