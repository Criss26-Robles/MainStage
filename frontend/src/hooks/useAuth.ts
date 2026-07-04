import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, logout as logoutAction } from '../store/authSlice';
import { setAuthToken } from '../services/api';
import type { User } from '../types';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth(): UseAuthResult {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((state) => state.auth);

  const login = (email: string, password: string) =>
    dispatch(loginUser({ email, password })).unwrap();
  const register = (name: string, email: string, password: string) =>
    dispatch(registerUser({ name, email, password })).unwrap();
  const logout = () => {
    setAuthToken(null);
    dispatch(logoutAction());
  };

  return {
    user,
    loading: !initialized,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
}
