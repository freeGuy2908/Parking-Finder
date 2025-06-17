import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // Middleware để tránh lỗi non-serializable value với Firebase user object
  // Firebase user object và timestamp có thể không serializable hoàn toàn.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
