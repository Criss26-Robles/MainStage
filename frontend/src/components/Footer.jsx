import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-icon">M</span>
            <span className="brand-wordmark">MainStage</span>
          </div>
          <p className="footer__tagline">
            La plataforma de boletos para los mejores conciertos, festivales y eventos en todo Colombia.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Navegación</h4>
            <Link to="/">Inicio</Link>
            <Link to="/eventos">Eventos</Link>
          </div>
          <div className="footer__col">
            <h4>Ciudades</h4>
            <Link to="/eventos?city=Bogotá">Bogotá</Link>
            <Link to="/eventos?city=Medellín">Medellín</Link>
            <Link to="/eventos?city=Cali">Cali</Link>
          </div>
          <div className="footer__col">
            <h4>Contacto</h4>
            <span>Bogotá, Colombia</span>
            <span>hola@mainstage.co</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>&copy; 2026 MainStage. Todos los derechos reservados.</span>
          <span className="footer__city">Colombia</span>
        </div>
      </div>
    </footer>
  );
}
