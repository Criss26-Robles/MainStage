import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="hero__gradient" />
        <div className="hero__grid" />
        <div className="hero__glow" />
      </div>

      <div className="container hero__content">
        <motion.div
          className="hero__text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Colombia
          </motion.p>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Vive la
            <span className="hero__title-accent"> experiencia</span>
            <br />
            en vivo
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Conciertos, festivales, teatro y más en todo el país. Encuentra y compra
            boletos para los mejores eventos de Colombia.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <Link to="/eventos" className="btn btn-primary">
              Explorar eventos
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#destacados" className="btn btn-outline">
              Ver destacados
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero__card hero__card--1">
            <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" alt="" />
          </div>
          <div className="hero__card hero__card--2">
            <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80" alt="" />
          </div>
          <div className="hero__card hero__card--3">
            <img src="https://images.unsplash.com/photo-1429962710814-755aa28af963?w=400&q=80" alt="" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="hero__scroll-line" />
      </motion.div>
    </section>
  );
}
