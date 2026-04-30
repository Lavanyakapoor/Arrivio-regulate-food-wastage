import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modal';
import uiReducer from './ui';
import inventoryReducer from './inventory';
import donationsReducer from './donations';
import analyticsReducer from './analytics';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    modal: modalReducer,
    inventory: inventoryReducer,
    donations: donationsReducer,
    analytics: analyticsReducer,
  },
});

export default store;
