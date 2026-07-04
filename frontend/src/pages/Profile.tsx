import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { fetchMyOrders, formatPrice, formatDate } from '../services/api';
import type { Order } from '../types';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/perfil' } } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (authLoading || !user) {
    return (
      <div className="profile-page profile-page--loading">
        <div className="container">Cargando...</div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="profile-page__user">
              <div className="profile-page__avatar">{initials}</div>
              <div>
                <h1 className="profile-page__name">{user.name}</h1>
                <p className="profile-page__email">{user.email}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container profile-page__content">
        <h2 className="profile-page__section-title">Mis compras</h2>

        {loading ? (
          <div className="profile-page__skeleton" />
        ) : orders.length === 0 ? (
          <div className="profile-page__empty">
            <p>Aún no has comprado boletos</p>
            <Link to="/eventos" className="btn btn-primary">Explorar eventos</Link>
          </div>
        ) : (
          <div className="profile-page__orders">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                className="profile-order"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="profile-order__main">
                  <h3>{order.eventTitle}</h3>
                  <p className="profile-order__meta">
                    {order.eventCity} · {formatDate(order.eventDate)}
                  </p>
                  {order.items && order.items.length > 0 && (
                    <p className="profile-order__tiers">
                      {order.items.map((it) => `${it.quantity}x ${it.tierName}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="profile-order__details">
                  <span className="profile-order__code">{order.confirmationCode}</span>
                  <span className="profile-order__qty">{order.quantity} boleto{order.quantity > 1 ? 's' : ''}</span>
                  <span className="profile-order__price">{formatPrice(order.totalPrice)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
