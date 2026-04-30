import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = 'http://localhost:4000';

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${BASE}/analytics`, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchAnalytics.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default analyticsSlice.reducer;
