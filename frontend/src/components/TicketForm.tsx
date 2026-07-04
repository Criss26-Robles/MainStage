import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, createOrder } from '../services/api';
import type { EventItem, Order } from '../types';
import './TicketForm.css';

interface TicketFormProps {
  event: EventItem;
}

export default function TicketForm({ event }: TicketFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const total = event.price * quantity;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createOrder({
        eventId: event.id,
        quantity
      });
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <motion.div
        className="ticket-form ticket-form--success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="ticket-form__success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h3>¡Compra confirmada!</h3>
        <p className="ticket-form__code">{order.confirmationCode}</p>
        <p className="ticket-form__success-detail">
          {order.quantity} boleto{order.quantity > 1 ? 's' : ''} para <strong>{order.eventTitle}</strong>
        </p>
        <p className="ticket-form__success-email">
          Enviamos la confirmación a {order.buyerEmail}
        </p>
        <p className="ticket-form__success-total">Total: {formatPrice(order.totalPrice)}</p>
        <Link to="/perfil" className="btn btn-outline ticket-form__profile-link">
          Ver mis compras
        </Link>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="ticket-form ticket-form--auth">
        <h3 className="ticket-form__title">Comprar boletos</h3>
        <p className="ticket-form__price">{formatPrice(event.price)} <span>por boleto</span></p>
        <div className="ticket-form__auth-prompt">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <p>Inicia sesión para comprar boletos</p>
        </div>
        <Link
          to="/login"
          state={{ from: location }}
          className="btn btn-primary ticket-form__submit"
        >
          Iniciar sesión
        </Link>
        <p className="ticket-form__auth-register">
          ¿No tienes cuenta? <Link to="/registro" state={{ from: location }}>Regístrate</Link>
        </p>
      </div>
    );
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <h3 className="ticket-form__title">Comprar boletos</h3>
      <p className="ticket-form__price">{formatPrice(event.price)} <span>por boleto</span></p>

      <div className="ticket-form__user-info">
        <span className="ticket-form__user-label">Comprando como</span>
        <span className="ticket-form__user-name">{user?.name}</span>
        <span className="ticket-form__user-email">{user?.email}</span>
      </div>

      <div className="ticket-form__quantity">
        <label>Cantidad</label>
        <div className="ticket-form__quantity-controls">
          <button
            type="button"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(q => Math.min(10, Math.min(event.availableTickets, q + 1)))}
            disabled={quantity >= 10 || quantity >= event.availableTickets}
          >
            +
          </button>
        </div>
        <span className="ticket-form__available">{event.availableTickets} disponibles</span>
      </div>

      <div className="ticket-form__total">
        <span>Total</span>
        <span className="ticket-form__total-amount">{formatPrice(total)}</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="ticket-form__error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" className="btn btn-primary ticket-form__submit" disabled={loading}>
        {loading ? 'Procesando...' : 'Confirmar compra'}
      </button>
    </form>
  );
}
