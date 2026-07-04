import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchEvents } from '../services/api';
import type { EventFilters, EventItem } from '../types';

interface EventsState {
  items: EventItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const loadEvents = createAsyncThunk<EventItem[], EventFilters | undefined>(
  'events/load',
  async (params = {}) => {
    return await fetchEvents(params);
  }
);

const initialState: EventsState = {
  items: [],
  status: 'idle',
  error: null
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Error al cargar eventos';
      });
  }
});

export default eventsSlice.reducer;
