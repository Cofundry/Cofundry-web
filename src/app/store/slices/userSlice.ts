// store/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
  }
  return null;
};

const initialState = {
  user: getInitialUser(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    logout(state) {
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
