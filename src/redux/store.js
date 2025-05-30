import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Thêm các reducers khác của bạn ở đây nếu có
  },
  // Middleware để tránh lỗi non-serializable value với Firebase user object
  // Firebase user object và timestamp có thể không serializable hoàn toàn.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
