import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchVenues } from '../services/api';
import './PopularVenues.css';

export default function PopularVenues() {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    fetchVenues().then(setVenues).catch(console.error);
  }, []);

  if (venues.length === 0) return null;

  return (
    <section className="venues-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="section-label">Escenarios icónicos</p>
          <h2 className="section-title venues-section__title">Escenarios más populares del país</h2>
        </motion.div>

        <div className="venues-grid">
          {venues.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/eventos?search=${encodeURIComponent(venue.name)}`}
                className="venue-card"
              >
                <div className="venue-card__image-wrap">
                  <img src={venue.image} alt={venue.name} loading="lazy" />
                  <div className="venue-card__overlay" />
                  <span className="venue-card__count">{venue.eventCount} eventos</span>
                </div>
                <div className="venue-card__body">
                  <h3 className="venue-card__name">{venue.name}</h3>
                  <p className="venue-card__location">{venue.city} · {venue.department}</p>
                  <p className="venue-card__desc">{venue.description}</p>
                  <span className="venue-card__capacity">Capacidad: {venue.capacity.toLocaleString('es-CO')}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
