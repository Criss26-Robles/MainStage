import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deleteEventReview, fetchEventReviews, saveEventReview } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { EventReview } from '../types';
import './EventReviews.css';

interface EventReviewsProps {
  eventId: number;
}

const MAX_COMMENT_LENGTH = 500;

function Stars({
  value,
  onChange,
  interactive = false
}: {
  value: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className={`event-reviews__stars ${interactive ? 'event-reviews__stars--interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'is-active' : ''}
          onClick={() => onChange?.(star)}
          disabled={!interactive}
          aria-label={`${star} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function EventReviews({ eventId }: EventReviewsProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const myReview = useMemo(
    () => reviews.find((review) => review.userId === user?.id),
    [reviews, user?.id]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEventReviews(eventId)
      .then((data) => {
        if (cancelled) return;
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudieron cargar las opiniones');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview]);

  const reloadReviews = async () => {
    const data = await fetchEventReviews(eventId);
    setReviews(data.reviews);
    setAverageRating(data.averageRating);
    setTotalReviews(data.totalReviews);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (comment.trim().length < 5) {
      setError('Escribe una opinion de al menos 5 caracteres');
      return;
    }

    setSaving(true);
    try {
      await saveEventReview(eventId, rating, comment.trim());
      await reloadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la opinion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    setError('');
    try {
      await deleteEventReview(reviewId);
      if (myReview?.id === reviewId) {
        setRating(5);
        setComment('');
      }
      await reloadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la opinion');
    }
  };

  return (
    <section className="event-reviews">
      <div className="event-reviews__header">
        <div>
          <span className="event-reviews__eyebrow">Opiniones</span>
          <h2>Resenas del evento</h2>
        </div>
        <div className="event-reviews__score">
          <strong>{averageRating ? averageRating.toFixed(1) : '0.0'}</strong>
          <Stars value={Math.round(averageRating)} />
          <span>{totalReviews} opinion{totalReviews === 1 ? '' : 'es'}</span>
        </div>
      </div>

      {isAuthenticated ? (
        <form className="event-reviews__form" onSubmit={handleSubmit}>
          <div className="event-reviews__form-head">
            <div>
              <span>Tu calificacion</span>
              <Stars value={rating} onChange={setRating} interactive />
            </div>
            {myReview && <span className="event-reviews__edit-label">Editando tu opinion</span>}
          </div>
          <textarea
            value={comment}
            maxLength={MAX_COMMENT_LENGTH}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Cuentanos como fue tu experiencia con este evento..."
          />
          <div className="event-reviews__form-footer">
            <span>{comment.length}/{MAX_COMMENT_LENGTH}</span>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : myReview ? 'Actualizar opinion' : 'Publicar opinion'}
            </button>
          </div>
        </form>
      ) : (
        <div className="event-reviews__login">
          <p>Inicia sesion para dejar tu calificacion y comentario.</p>
          <Link to="/login" state={{ from: location }} className="btn btn-primary">
            Iniciar sesion
          </Link>
        </div>
      )}

      {error && <p className="event-reviews__error">{error}</p>}

      {loading ? (
        <div className="event-reviews__skeleton" />
      ) : reviews.length === 0 ? (
        <div className="event-reviews__empty">Aun no hay opiniones para este evento.</div>
      ) : (
        <div className="event-reviews__list">
          {reviews.map((review) => {
            const canDelete = review.userId === user?.id || isAdmin;
            return (
              <article key={review.id} className="event-review">
                <div className="event-review__top">
                  <div>
                    <h3>{review.user.name}</h3>
                    <Stars value={review.rating} />
                  </div>
                  {canDelete && (
                    <button type="button" onClick={() => handleDelete(review.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
                <p>{review.comment}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
