import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = 'http://localhost:4000';

export const fetchDonations = createAsyncThunk('donations/fetchDonations', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${BASE}/donations`, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch donations');
  }
});

export const listForDonation = createAsyncThunk('donations/listForDonation', async (donationData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${BASE}/donations`, donationData, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to list donation');
  }
});

export const claimDonation = createAsyncThunk('donations/claimDonation', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${BASE}/donations/${id}/claim`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to claim donation');
  }
});

const donationsSlice = createSlice({
  name: 'donations',
  initialState: {
    donations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDonations.fulfilled, (state, action) => { state.loading = false; state.donations = action.payload; })
      .addCase(fetchDonations.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(listForDonation.fulfilled, (state, action) => {
        state.donations.push(action.payload);
      })

      .addCase(claimDonation.fulfilled, (state, action) => {
        state.donations = state.donations.filter(d => d._id !== action.payload._id);
      });
  },
});

export default donationsSlice.reducer;
