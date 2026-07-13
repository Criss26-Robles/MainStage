import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  buyResaleListing,
  fetchResaleListings,
  formatDate,
  formatPrice
} from '../services/api';
import type { ResaleListing } from '../types';
import './Resale.css';

export default function Resale() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetchResaleListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleBuy = async (id: number) => {
    if (!isAuthenticated) return;
    setBuyingId(id);
    setError('');
    try {
      await buyResaleListing(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la compra');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="resale-page">
      <div className="container">
        <header className="resale-page__header">
          <h1>Reventa verificada</h1>
          <p>Solo boletos reales con orden confirmada en MainStage</p>
        </header>

        {error && <p className="resale-page__error">{error}</p>}

        {loading ? (
          <p>Cargando listados...</p>
        ) : listings.length === 0 ? (
          <div className="resale-page__empty">
            <p>No hay boletos en reventa por ahora</p>
            <Link to="/eventos" className="btn btn-primary">Ver eventos</Link>
          </div>
        ) : (
          <div className="resale-page__grid">
            {listings.map((listing) => (
              <article key={listing.id} className="resale-card">
                <h3>{listing.order.eventTitle}</h3>
                <p className="resale-card__meta">
                  {listing.order.eventCity} · {formatDate(listing.order.eventDate)}
                </p>
                <p className="resale-card__qty">{listing.order.quantity} boleto(s)</p>
                <p className="resale-card__seller">Vendedor: {listing.seller.name}</p>
                <p className="resale-card__price">{formatPrice(listing.askPrice)}</p>
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleBuy(listing.id)}
                    disabled={buyingId === listing.id}
                  >
                    {buyingId === listing.id ? 'Comprando...' : 'Comprar'}
                  </button>
                ) : (
                  <Link to="/login" state={{ from: { pathname: '/reventa' } }} className="btn btn-outline">
                    Inicia sesión para comprar
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
