import "react-native-gesture-handler";

import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Redux
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/redux/store";
import {
  setUser,
  logout,
  setLoading,
  selectIsAuthenticated,
  selectIsLoading,
} from "./src/redux/authSlice";

// Firebase
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import HomeScreen from "./src/screens/HomeScreen";

// import auth navigators
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";

// import main app navigators
import CustomerNavigator from "./src/navigation/CustomerNavigator";
import OwnerNavigator from "./src/navigation/OwnerNavigator";
import StaffNavigator from "./src/navigation/StaffNavigator";

const Stack = createStackNavigator();

// Màn hình Splash đơn giản
const SplashScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
    }}
  >
    <ActivityIndicator size="large" color="#4F46E5" />
    <Text style={{ marginTop: 10, fontSize: 16, color: "#4F46E5" }}>
      Đang tải ứng dụng...
    </Text>
  </View>
);

// Component điều hướng chính của ứng dụng
function RootNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoadingAuth = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: userData.fullName, // Lấy fullName từ Firestore
                phone: userData.phone,
                createdAt: userData.createdAt,
              })
            );
          } else {
            console.warn(
              "User document không tồn tại trong Firestore cho UID:",
              firebaseUser.uid
            );
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || "Người dùng",
              })
            );
          }
        } catch (error) {
          console.error("Lỗi lấy thông tin user từ Firestore:", error);
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || "Người dùng",
            })
          );
        }
      } else {
        dispatch(logout());
      }
      // setLoading(false) đã được gọi trong setUser và logout của authSlice
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (isLoadingAuth) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "HomeScreen" : "HomeScreen"}
      >
        {/* Màn hình HomeScreen luôn có thể truy cập */}
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        {!isAuthenticated ? (
          <>
            {/* Auth screens khi chưa đăng nhập */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {/* Các màn hình chính khi đã đăng nhập */}
            {/* HomeScreen vẫn có thể được truy cập lại từ đây nếu cần, hoặc bạn có thể có một Home khác cho người dùng đã đăng nhập */}
          </>
        )}
        {/* Các Navigators này có thể cần kiểm tra quyền truy cập bên trong chúng hoặc dựa vào vai trò user */}
        <Stack.Screen
          name="CustomerTabs"
          component={CustomerNavigator}
          options={{ headerShown: false, title: "Khách" }}
        />
        <Stack.Screen
          name="OwnerTabs"
          component={OwnerNavigator}
          options={{ headerShown: false, title: "Chủ bãi xe" }}
        />
        <Stack.Screen
          name="StaffTabs"
          component={StaffNavigator}
          options={{ headerShown: false, title: "Nhân viên" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
