import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-icon">M</span>
          <div>
            <span className="admin-sidebar__logo-text brand-wordmark">MainStage</span>
            <span className="admin-sidebar__logo-sub">Admin</span>
          </div>
        </Link>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/eventos" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Eventos
          </NavLink>
          <NavLink to="/admin/ventas" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Ventas
          </NavLink>
          <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Usuarios
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__user">{user?.name}</p>
          <Link to="/" className="admin-sidebar__back">← Ver sitio</Link>
          <button className="admin-sidebar__logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
