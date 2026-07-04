import './Marquee.css';

const items = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga',
  'Conciertos', 'Festivales', 'Teatro', 'Colombia', 'En vivo', 'MainStage'
];

export default function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div className="marquee">
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <span className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
