import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function resolveFromPath(stateFrom) {
  if (!stateFrom) return '/';
  if (typeof stateFrom === 'string') return stateFrom;
  return stateFrom.pathname || '/';
}

function getRedirectPath(from, role) {
  const isAdminRoute = from.startsWith('/admin');

  if (isAdminRoute && role === 'admin') return from;
  if (isAdminRoute && role !== 'admin') return '/';
  if (role === 'admin' && (from === '/login' || from === '/registro')) return '/admin';

  return from;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = resolveFromPath(location.state?.from);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      navigate(getRedirectPath(from, userData.role || 'user'), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-page__gradient" />
        <div className="auth-page__grid" />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <span className="auth-card__logo-icon">M</span>
            <span className="brand-wordmark">MainStage</span>
          </Link>
          <h1>Iniciar sesión</h1>
          <p>Usuarios y administradores ingresan desde aquí con su cuenta</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="auth-form__field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-form__submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </motion.div>
    </div>
  );
}
