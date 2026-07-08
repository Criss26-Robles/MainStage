import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { imageObjectPosition, imageUrl as buildImageUrl } from '../../utils/imageUrl';
import './ImageFocusPicker.css';

interface ImageFocusPickerProps {
  imageUrl: string;
  title: string;
  artist: string;
  focusX: number;
  focusY: number;
  onChange: (x: number, y: number) => void;
}

export default function ImageFocusPicker({
  imageUrl,
  title,
  artist,
  focusX,
  focusY,
  onChange
}: ImageFocusPickerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const objectPosition = imageObjectPosition({ x: focusX, y: focusY });
  const focusImageStyle = {
    objectPosition,
    transformOrigin: objectPosition
  };
  const previewTitle = title.trim() || 'Título del evento';
  const previewArtist = artist.trim() || 'Artista / organizador';

  const updateFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onChange(Math.round(Math.min(100, Math.max(0, x))), Math.round(Math.min(100, Math.max(0, y))));
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromPointer(e);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="image-focus">
      <div className="image-focus__header">
        <div>
          <p className="image-focus__label">Encuadre del banner</p>
          <p className="image-focus__hint">Haz clic o arrastra sobre la imagen para elegir la zona visible</p>
        </div>
        <button
          type="button"
          className="btn btn-outline image-focus__reset"
          onClick={() => onChange(50, 50)}
        >
          Centrar
        </button>
      </div>

      <div className="image-focus__previews">
        <div className="image-focus__panel">
          <span className="image-focus__panel-tag">Ajustar zona</span>
          <div
            ref={frameRef}
            className={`image-focus__frame${dragging ? ' image-focus__frame--dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            role="presentation"
          >
            <img
              src={buildImageUrl(imageUrl, 'hero')}
              alt=""
              style={focusImageStyle}
              draggable={false}
            />
            <span
              className="image-focus__marker"
              style={{ left: `${focusX}%`, top: `${focusY}%` }}
              aria-hidden
            />
          </div>
        </div>

        <div className="image-focus__panel">
          <span className="image-focus__panel-tag">Vista en el sitio</span>
          <div className="image-focus__site-mock">
            <img
              src={buildImageUrl(imageUrl, 'hero')}
              alt=""
              style={focusImageStyle}
              draggable={false}
            />
            <div className="image-focus__site-overlay" />
            <div className="image-focus__site-content">
              <span className="image-focus__site-tag">Concierto</span>
              <h3>{previewTitle}</h3>
              <p>{previewArtist}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="image-focus__sliders">
        <label>
          <span>Horizontal ({focusX}%)</span>
          <input
            type="range"
            min={0}
            max={100}
            value={focusX}
            onChange={(e) => onChange(parseInt(e.target.value, 10), focusY)}
          />
        </label>
        <label>
          <span>Vertical ({focusY}%)</span>
          <input
            type="range"
            min={0}
            max={100}
            value={focusY}
            onChange={(e) => onChange(focusX, parseInt(e.target.value, 10))}
          />
        </label>
      </div>
    </div>
  );
}
