import { configureStore } from '@reduxjs/toolkit';
import userSliceReducer from './states/user';

const store = configureStore({
  reducer: {
    user: userSliceReducer
  }
});

export default store;
