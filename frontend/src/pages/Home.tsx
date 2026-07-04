import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import EventSection from '../components/EventSection';
import PopularVenues from '../components/PopularVenues';
import { loadEvents } from '../store/eventsSlice';
import type { EventItem } from '../types';
import './Home.css';

const CATEGORY_SECTIONS = [
  { key: 'Concierto', label: 'Música en vivo', title: 'Conciertos' },
  { key: 'Festival', label: 'Grandes festivales', title: 'Festivales' },
  { key: 'Teatro', label: 'Artes escénicas', title: 'Teatro' },
  { key: 'Museo', label: 'Cultura y arte', title: 'Museos' },
  { key: 'Comedia', label: 'Risas garantizadas', title: 'Comedia' },
  { key: 'Electrónica', label: 'Noche y beats', title: 'Electrónica' }
];

export default function Home() {
  const dispatch = useAppDispatch();
  const allEvents = useAppSelector((state) => state.events.items);
  const loading = useAppSelector(
    (state) => state.events.status === 'loading' || state.events.status === 'idle'
  );

  useEffect(() => {
    dispatch(loadEvents());
  }, [dispatch]);

  const popular = allEvents
    .filter(e => e.popular)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const featured = allEvents.filter(e => e.featured);

  const byCategory = (cat: string) =>
    allEvents.filter((e: EventItem) => e.category === cat).slice(0, 3);

  return (
    <div className="home">
      <EventSection
        id="populares"
        label="Lo más buscado"
        title="Próximos eventos más populares"
        events={popular}
        layout="horizontal"
        viewAllLink="/eventos"
        loading={loading}
      />

      <EventSection
        id="destacados"
        label="Selección MainStage"
        title="Más destacados"
        events={featured}
        layout="vertical"
        viewAllLink="/eventos?featured=true"
        loading={loading}
      />

      {CATEGORY_SECTIONS.map(({ key, label, title }) => (
        <EventSection
          key={key}
          label={label}
          title={title}
          events={byCategory(key)}
          layout="vertical"
          viewAllLink={`/eventos?category=${encodeURIComponent(key)}`}
          loading={loading}
        />
      ))}

      <PopularVenues />
    </div>
  );
}
