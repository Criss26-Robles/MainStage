import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loadUser } from './authSlice';
import eventsReducer from './eventsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer
  }
});

store.dispatch(loadUser());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
