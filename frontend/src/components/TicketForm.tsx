import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  formatPrice,
  getDiscountedPrice,
  getServiceFee,
  getFinalPrice,
  createOrder,
  fetchPurchaseInfo
} from '../services/api';
import type { EventItem, Order, PurchaseInfo, TicketTier } from '../types';
import './TicketForm.css';

const MAX_PER_ORDER = 10;

interface TicketFormProps {
  event: EventItem;
}

export default function TicketForm({ event }: TicketFormProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const feePercent = event.serviceFeePercent ?? 10;

  const tiers: TicketTier[] = useMemo(() => {
    if (event.tiers && event.tiers.length > 0) return event.tiers;
    return [
      {
        id: 0,
        name: 'General',
        price: event.price,
        available: event.availableTickets,
        description: '',
        sortOrder: 0
      }
    ];
  }, [event]);

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPurchaseInfo(null);
      return;
    }
    fetchPurchaseInfo(event.id)
      .then(setPurchaseInfo)
      .catch(() => setPurchaseInfo(null));
  }, [event.id, isAuthenticated]);

  const unitPriceOf = (tier: TicketTier) => getDiscountedPrice(tier.price, event.discount);
  const serviceFeeOf = (tier: TicketTier) => getServiceFee(unitPriceOf(tier), feePercent);
  const finalPriceOf = (tier: TicketTier) =>
    getFinalPrice(tier.price, event.discount, feePercent);

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalTicketPrice = tiers.reduce(
    (sum, tier) => sum + unitPriceOf(tier) * (quantities[tier.id] || 0),
    0
  );
  const totalServiceFee = tiers.reduce(
    (sum, tier) => sum + serviceFeeOf(tier) * (quantities[tier.id] || 0),
    0
  );
  const totalPrice = totalTicketPrice + totalServiceFee;
  const minPrice = Math.min(...tiers.map((t) => finalPriceOf(t)));
  const maxAllowed = purchaseInfo?.remaining ?? 4;
  const isPresaleBlocked =
    event.salePhase === 'presale' && isAuthenticated && user && !user.presaleAccess;

  const changeQty = (tier: TicketTier, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tier.id] || 0;
      let next = current + delta;
      if (next < 0) next = 0;
      if (next > tier.available) next = tier.available;
      const others = totalQuantity - current;
      const orderCap = Math.min(MAX_PER_ORDER, maxAllowed);
      if (others + next > orderCap) next = Math.max(orderCap - others, 0);
      return { ...prev, [tier.id]: next };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const items = tiers
      .filter((t) => (quantities[t.id] || 0) > 0)
      .map((t) => ({ tierId: t.id, quantity: quantities[t.id] }));

    if (items.length === 0) {
      setError('Selecciona al menos una boleta');
      return;
    }

    setLoading(true);
    try {
      const result = await createOrder({ eventId: event.id, items });
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
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>¡Compra confirmada!</h3>
        <p className="ticket-form__code">{order.confirmationCode}</p>
        {order.items && order.items.length > 0 && (
          <ul className="ticket-form__success-items">
            {order.items.map((it) => (
              <li key={it.id}>
                <span>{it.quantity}x {it.tierName}</span>
                <span>{formatPrice(it.subtotal)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="ticket-form__success-detail">
          para <strong>{order.eventTitle}</strong>
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
        <h3 className="ticket-form__title">Comprar boletas</h3>
        <p className="ticket-form__price">
          <span>Desde</span> {formatPrice(minPrice)}
          {event.price > 0 && feePercent > 0 && (
            <span className="ticket-form__fee-note"> (incl. comisión {feePercent}%)</span>
          )}
        </p>
        {event.salePhase === 'presale' && (
          <p className="ticket-form__presale-note">Este evento está en preventa para miembros.</p>
        )}
        <div className="ticket-form__auth-prompt">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <p>Inicia sesión para comprar boletas</p>
        </div>
        <Link to="/login" state={{ from: location }} className="btn btn-primary ticket-form__submit">
          Iniciar sesión
        </Link>
        <p className="ticket-form__auth-register">
          ¿No tienes cuenta? <Link to="/registro" state={{ from: location }}>Regístrate</Link>
        </p>
      </div>
    );
  }

  if (isPresaleBlocked) {
    return (
      <div className="ticket-form ticket-form--blocked">
        <h3 className="ticket-form__title">Preventa exclusiva</h3>
        <p className="ticket-form__blocked-msg">
          Este evento está en fase de preventa. Necesitas acceso de membresía para comprar boletas.
        </p>
        <p className="ticket-form__price">
          <span>Desde</span> {formatPrice(minPrice)}
          <span className="ticket-form__fee-note"> (incl. comisión {feePercent}%)</span>
        </p>
      </div>
    );
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <h3 className="ticket-form__title">Comprar boletas</h3>
      <p className="ticket-form__price">
        <span>Desde</span> {formatPrice(minPrice)}
        {event.price > 0 && feePercent > 0 && (
          <span className="ticket-form__fee-note"> (incl. comisión {feePercent}%)</span>
        )}
      </p>

      {purchaseInfo && purchaseInfo.remaining < 4 && (
        <p className="ticket-form__hint">
          Puedes comprar hasta {purchaseInfo.remaining} boleta(s) más para este evento.
        </p>
      )}

      <div className="ticket-form__user-info">
        <span className="ticket-form__user-label">Comprando como</span>
        <span className="ticket-form__user-name">{user?.name}</span>
        <span className="ticket-form__user-email">{user?.email}</span>
      </div>

      <div className="ticket-form__tiers">
        {tiers.map((tier) => {
          const qty = quantities[tier.id] || 0;
          const unit = unitPriceOf(tier);
          const fee = serviceFeeOf(tier);
          const final = finalPriceOf(tier);
          const hasDiscount = event.discount > 0 && tier.price > 0;
          const soldOut = tier.available <= 0;
          const orderCap = Math.min(MAX_PER_ORDER, maxAllowed);
          return (
            <div key={tier.id} className={`tier-row${soldOut ? ' tier-row--soldout' : ''}`}>
              <div className="tier-row__info">
                <span className="tier-row__name">{tier.name}</span>
                {tier.description && <span className="tier-row__desc">{tier.description}</span>}
                <span className="tier-row__price">
                  {hasDiscount && (
                    <span className="tier-row__price-old">{formatPrice(tier.price)}</span>
                  )}
                  {formatPrice(final)}
                </span>
                {fee > 0 && (
                  <span className="tier-row__fee">
                    {formatPrice(unit)} + {formatPrice(fee)} comisión
                  </span>
                )}
                <span className="tier-row__available">
                  {soldOut ? 'Agotado' : `${tier.available} disponibles`}
                </span>
              </div>
              <div className="tier-row__controls">
                <button
                  type="button"
                  onClick={() => changeQty(tier, -1)}
                  disabled={qty <= 0}
                  aria-label={`Quitar ${tier.name}`}
                >
                  −
                </button>
                <span className="tier-row__qty">{qty}</span>
                <button
                  type="button"
                  onClick={() => changeQty(tier, 1)}
                  disabled={soldOut || qty >= tier.available || totalQuantity >= orderCap}
                  aria-label={`Agregar ${tier.name}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalQuantity > 0 && (
        <div className="ticket-form__summary">
          {tiers
            .filter((t) => (quantities[t.id] || 0) > 0)
            .map((t) => (
              <div key={t.id} className="ticket-form__summary-row">
                <span>{quantities[t.id]}x {t.name}</span>
                <span>{formatPrice(finalPriceOf(t) * quantities[t.id])}</span>
              </div>
            ))}
          {totalServiceFee > 0 && (
            <div className="ticket-form__summary-row ticket-form__summary-row--fee">
              <span>Comisión de servicio</span>
              <span>{formatPrice(totalServiceFee)}</span>
            </div>
          )}
        </div>
      )}

      <div className="ticket-form__total">
        <span>Total ({totalQuantity} {totalQuantity === 1 ? 'boleta' : 'boletas'})</span>
        <span className="ticket-form__total-amount">{formatPrice(totalPrice)}</span>
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

      <button
        type="submit"
        className="btn btn-primary ticket-form__submit"
        disabled={loading || totalQuantity === 0 || maxAllowed === 0}
      >
        {loading ? 'Procesando...' : 'Confirmar compra'}
      </button>
      {totalQuantity >= Math.min(MAX_PER_ORDER, maxAllowed) && (
        <p className="ticket-form__hint">
          Máximo {Math.min(MAX_PER_ORDER, maxAllowed)} boletas por compra
        </p>
      )}
    </form>
  );
}
