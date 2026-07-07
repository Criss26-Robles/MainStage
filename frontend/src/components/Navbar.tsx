import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const categories = [
  {
    label: 'Conciertos',
    category: 'Concierto',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    )
  },
  {
    label: 'Teatro',
    category: 'Teatro',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12h6l2-9 2 18 2-9h6"/>
      </svg>
    )
  },
  {
    label: 'Museos',
    category: 'Museo',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>
      </svg>
    )
  },
  {
    label: 'Festivales',
    category: 'Festival',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setLogoutConfirmOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/eventos', label: 'Eventos' }
  ];

  const activeCategory = new URLSearchParams(location.search).get('category');

  const requestLogout = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLogoutConfirmOpen(false);
    setUserMenuOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '';

  return (
    <div className="navbar">
      <div className="container navbar__inner">
        <div className="navbar__brand">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">M</span>
            <span className="navbar__logo-text brand-wordmark">MainStage</span>
          </Link>

          <div className="navbar__indicators">
            {categories.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <Link
                  to={`/eventos?category=${encodeURIComponent(item.category)}`}
                  className={`navbar__indicator ${activeCategory === item.category ? 'navbar__indicator--active' : ''}`}
                  title={item.label}
                >
                  <span className="navbar__indicator-icon">{item.icon}</span>
                  <span className="navbar__indicator-label">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          {links.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                to={link.to}
                className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}

          <div className="navbar__mobile-categories">
            {categories.map(item => (
              <Link
                key={item.category}
                to={`/eventos?category=${encodeURIComponent(item.category)}`}
                className="navbar__mobile-cat"
              >
                <span className="navbar__indicator-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="navbar__user" ref={userMenuRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Menú de usuario"
              >
                <span className="navbar__user-avatar">{initials}</span>
                <span className="navbar__user-name">{user?.name.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`navbar__user-chevron ${userMenuOpen ? 'navbar__user-chevron--open' : ''}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {userMenuOpen && (
                <div className="navbar__user-menu">
                  <div className="navbar__user-menu-header">
                    <span className="navbar__user-menu-name">{user?.name}</span>
                    <span className="navbar__user-menu-email">{user?.email}</span>
                  </div>
                  <Link to="/perfil" className="navbar__user-menu-item">Mis compras</Link>
                  {isAdmin && (
                    <Link to="/admin" className="navbar__user-menu-item">Panel admin</Link>
                  )}
                  <button className="navbar__user-menu-item navbar__user-menu-item--logout" onClick={requestLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__auth-login">Ingresar</Link>
              <Link to="/registro" className="btn btn-primary navbar__cta">Registrarse</Link>
            </div>
          )}

          {isAuthenticated && (
            <Link to="/eventos" className="btn btn-primary navbar__cta navbar__cta--mobile-buy">
              Comprar boletos
            </Link>
          )}
        </nav>

        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span />
          <span />
        </button>
      </div>

      {logoutConfirmOpen && (
        <div className="logout-confirm" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
          <div className="logout-confirm__panel">
            <p className="logout-confirm__eyebrow">Confirmar acción</p>
            <h2 id="logout-confirm-title" className="logout-confirm__title">Cerrar sesión</h2>
            <p className="logout-confirm__text">
              Tu sesión actual se cerrará y volverás al inicio. Puedes ingresar nuevamente cuando quieras.
            </p>
            <div className="logout-confirm__actions">
              <button
                type="button"
                className="btn btn-outline logout-confirm__cancel"
                onClick={() => setLogoutConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary logout-confirm__submit"
                onClick={handleLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
