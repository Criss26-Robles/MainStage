import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  login as apiLogin,
  register as apiRegister,
  fetchMe,
  setAuthToken,
  getAuthToken
} from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading';
  error: string | null;
  initialized: boolean;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk<User, Credentials>(
  'auth/login',
  async ({ email, password }) => {
    const { user, token } = await apiLogin(email, password);
    setAuthToken(token);
    return user;
  }
);

export const registerUser = createAsyncThunk<User, RegisterData>(
  'auth/register',
  async ({ name, email, password }) => {
    const { user, token } = await apiRegister(name, email, password);
    setAuthToken(token);
    return user;
  }
);

export const loadUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) return rejectWithValue('no-token');
    try {
      return await fetchMe();
    } catch (err) {
      setAuthToken(null);
      return rejectWithValue(err instanceof Error ? err.message : 'error');
    }
  }
);

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  initialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
        state.initialized = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.status = 'idle';
        state.initialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message ?? 'Error de autenticación';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
