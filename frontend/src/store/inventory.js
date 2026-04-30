import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = 'http://localhost:4000';

export const fetchItems = createAsyncThunk('inventory/fetchItems', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${BASE}/items`, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch items');
  }
});

export const addItem = createAsyncThunk('inventory/addItem', async (itemData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${BASE}/items`, itemData, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to add item');
  }
});

export const updateItem = createAsyncThunk('inventory/updateItem', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${BASE}/items/${id}`, data, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to update item');
  }
});

export const deleteItem = createAsyncThunk('inventory/deleteItem', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE}/items/${id}`, { withCredentials: true });
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to delete item');
  }
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchItems.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchItems.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addItem.fulfilled, (state, action) => { state.loading = false; state.items.push(action.payload); })
      .addCase(addItem.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;
