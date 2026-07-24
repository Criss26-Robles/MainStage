import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  fetchMyOrders,
  fetchFavoriteEvents,
  formatPrice,
  formatDate,
  createResaleListing,
  getFinalPrice,
  removeFavorite
} from '../services/api';
import OrderQr from '../components/OrderQr';
import type { EventItem, Order } from '../types';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [resaleError, setResaleError] = useState('');
  const [resaleOrder, setResaleOrder] = useState<Order | null>(null);
  const [resalePrice, setResalePrice] = useState('');
  const [resaleSubmitting, setResaleSubmitting] = useState(false);
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

      fetchFavoriteEvents()
        .then(setFavoriteEvents)
        .catch(console.error)
        .finally(() => setFavoritesLoading(false));
    }
  }, [isAuthenticated]);

  const openResaleModal = (order: Order) => {
    setResaleError('');
    setResaleOrder(order);
    setResalePrice(String(order.totalPrice));
  };

  const closeResaleModal = () => {
    if (resaleSubmitting) return;
    setResaleOrder(null);
    setResalePrice('');
    setResaleError('');
  };

  const handleResell = async (e: FormEvent) => {
    e.preventDefault();
    if (!resaleOrder) return;

    const askPrice = parseInt(resalePrice.replace(/\D/g, ''), 10);
    if (!askPrice || askPrice <= 0) {
      setResaleError('Ingresa un precio válido para publicar tu boleto en reventa.');
      return;
    }

    setResaleError('');
    setResaleSubmitting(true);
    try {
      await createResaleListing(resaleOrder.id, askPrice);
      const updated = await fetchMyOrders();
      setOrders(updated);
      setResaleOrder(null);
      setResalePrice('');
    } catch (err) {
      setResaleError(err instanceof Error ? err.message : 'No se pudo publicar en reventa');
    } finally {
      setResaleSubmitting(false);
    }
  };

  const canResell = (order: Order) =>
    order.status === 'active' && !order.qrUsed;

  const handleRemoveFavorite = async (eventId: number) => {
    try {
      await removeFavorite(eventId);
      setFavoriteEvents((current) => current.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error(err);
    }
  };

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

        {resaleError && !resaleOrder && <p className="profile-page__resale-error">{resaleError}</p>}

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
                  {order.status === 'listed' && (
                    <span className="profile-order__listed">En reventa</span>
                  )}
                  {canResell(order) && (
                    <button
                      type="button"
                      className="btn btn-outline profile-order__resell"
                      onClick={() => openResaleModal(order)}
                    >
                      Revender
                    </button>
                  )}
                  <OrderQr orderId={order.id} compact />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <section className="profile-page__favorites">
          <div className="profile-page__section-head">
            <h2 className="profile-page__section-title">Eventos guardados</h2>
            <Link to="/eventos" className="profile-page__section-link">Explorar eventos</Link>
          </div>

          {favoritesLoading ? (
            <div className="profile-page__skeleton" />
          ) : favoriteEvents.length === 0 ? (
            <div className="profile-page__empty profile-page__empty--compact">
              <p>No tienes eventos guardados todavia</p>
            </div>
          ) : (
            <div className="profile-favorites">
              {favoriteEvents.map((event) => (
                <article key={event.id} className="profile-favorite">
                  <Link to={`/evento/${event.id}`} className="profile-favorite__image-link">
                    <img src={event.image} alt={event.title} className="profile-favorite__image" />
                  </Link>
                  <div className="profile-favorite__body">
                    <span className="profile-favorite__category">{event.category}</span>
                    <Link to={`/evento/${event.id}`} className="profile-favorite__title">
                      {event.title}
                    </Link>
                    <p className="profile-favorite__meta">
                      {event.city} · {formatDate(event.date)}
                    </p>
                    <p className="profile-favorite__price">
                      {formatPrice(getFinalPrice(event.price, event.discount, event.serviceFeePercent ?? 10))}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="profile-favorite__remove"
                    onClick={() => handleRemoveFavorite(event.id)}
                  >
                    Quitar
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {resaleOrder && (
        <div className="profile-resale-modal" role="dialog" aria-modal="true" aria-labelledby="resale-modal-title">
          <form className="profile-resale-modal__card" onSubmit={handleResell}>
            <button
              type="button"
              className="profile-resale-modal__close"
              onClick={closeResaleModal}
              aria-label="Cerrar"
            >
              ×
            </button>
            <span className="profile-resale-modal__eyebrow">Reventa MainStage</span>
            <h2 id="resale-modal-title">Publicar boleto en reventa</h2>
            <p className="profile-resale-modal__copy">
              Define el precio de publicación para tu entrada. Otros usuarios podrán verla en la sección de reventa.
            </p>

            <div className="profile-resale-modal__event">
              <strong>{resaleOrder.eventTitle}</strong>
              <span>{resaleOrder.eventCity} · {formatDate(resaleOrder.eventDate)}</span>
            </div>

            <label className="profile-resale-modal__field">
              <span>Precio de publicación</span>
              <div className="profile-resale-modal__input-wrap">
                <span>COP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={resalePrice}
                  onChange={(e) => setResalePrice(e.target.value)}
                  placeholder="Ej: 350000"
                  autoFocus
                />
              </div>
            </label>

            {resaleError && <p className="profile-resale-modal__error">{resaleError}</p>}

            <div className="profile-resale-modal__actions">
              <button type="button" className="btn btn-outline" onClick={closeResaleModal} disabled={resaleSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={resaleSubmitting}>
                {resaleSubmitting ? 'Publicando...' : 'Publicar reventa'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
