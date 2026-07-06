import { useEffect } from 'react';
import type { EventItem } from '../../types';
import { formatPrice, formatShortDate } from '../../services/api';
import './DeleteEventModal.css';

interface DeleteEventModalProps {
  event: EventItem | null;
  open: boolean;
  deleting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteEventModal({
  event,
  open,
  deleting,
  error,
  onCancel,
  onConfirm
}: DeleteEventModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, deleting, onCancel]);

  if (!open || !event) return null;

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-event-title">
      <button
        type="button"
        className="admin-modal__backdrop"
        onClick={deleting ? undefined : onCancel}
        aria-label="Cerrar"
        disabled={deleting}
      />

      <div className="admin-modal__panel admin-modal__panel--danger">
        <div className="admin-modal__icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 id="delete-event-title" className="admin-modal__title">¿Eliminar este evento?</h2>
        <p className="admin-modal__subtitle">
          Esta acción es permanente y no se puede deshacer.
        </p>

        <div className="admin-modal__event">
          <p className="admin-modal__event-title">{event.title}</p>
          <p className="admin-modal__event-meta">
            {event.artist} · {event.city} · {formatShortDate(event.date)}
          </p>
          <p className="admin-modal__event-meta">
            Desde {formatPrice(event.price)} · {event.availableTickets} boletos disponibles
          </p>
        </div>

        <ul className="admin-modal__warnings">
          <li>Se borrará el evento del catálogo público.</li>
          <li>Se eliminarán sus tipos de boleta (General, VIP, etc.).</li>
          <li>Se eliminarán las órdenes de compra asociadas a este evento.</li>
        </ul>

        {error && <p className="admin-modal__error">{error}</p>}

        <div className="admin-modal__actions">
          <button
            type="button"
            className="btn btn-outline admin-modal__btn"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn admin-modal__btn admin-modal__btn--danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Sí, eliminar evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
