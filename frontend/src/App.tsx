import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Resale from './pages/Resale';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTicketVerify from './pages/admin/AdminTicketVerify';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="eventos" element={<AdminEvents />} />
        <Route path="eventos/nuevo" element={<AdminEventForm />} />
        <Route path="eventos/:id/editar" element={<AdminEventForm />} />
        <Route path="ventas" element={<AdminOrders />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="verificar-boleto" element={<AdminTicketVerify />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/eventos" element={<Events />} />
        <Route path="/evento/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/reventa" element={<Resale />} />
      </Route>
    </Routes>
  );
}
