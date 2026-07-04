import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCities } from '../services/api';
import type { City } from '../types';
import './Cities.css';

export default function Cities() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetchCities().then(setCities).catch(console.error);
  }, []);

  if (cities.length === 0) return null;

  return (
    <section className="cities">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">Explora por ciudad</p>
          <h2 className="section-title cities__title">Eventos en todo el país</h2>
        </motion.div>

        <div className="cities__grid">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/eventos?city=${encodeURIComponent(city.name)}`}
                className="cities__card"
              >
                <span className="cities__name">{city.name}</span>
                <span className="cities__dept">{city.department}</span>
                <span className="cities__count">
                  {city.count} evento{city.count !== 1 ? 's' : ''}
                </span>
                <svg className="cities__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
