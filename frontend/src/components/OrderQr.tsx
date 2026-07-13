import { useEffect, useState } from 'react';
import { fetchOrderQr } from '../services/api';
import './OrderQr.css';

interface OrderQrProps {
  orderId: number;
  compact?: boolean;
}

export default function OrderQr({ orderId, compact = false }: OrderQrProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [qrUsed, setQrUsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderQr(orderId)
      .then((data) => {
        setQrImage(data.qrImage);
        setQrCode(data.qrCode);
        setQrUsed(data.qrUsed);
      })
      .catch(() => setQrImage(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="order-qr__loading">Cargando boleto...</p>;
  if (!qrImage) return null;

  return (
    <div className={`order-qr${compact ? ' order-qr--compact' : ''}`}>
      <img src={qrImage} alt="Código QR del boleto" className="order-qr__image" />
      <p className="order-qr__code">{qrCode.slice(0, 8)}…</p>
      {qrUsed && <span className="order-qr__used">Usado</span>}
    </div>
  );
}
