import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Car,
  UserCircle,
  Users,
  LogIn,
  LogOut,
  AlertCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectUser, logout } from "../redux/authSlice";

// firebase
import { db } from "../../firebaseConfig"; // Đường dẫn tới file cấu hình Firebase
import { collection, query, where, getDocs } from "firebase/firestore";

export default function HomeScreen() {
  const navigation = useNavigation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkStaffStatus();
    }
  }, [isAuthenticated, user]);

  const checkStaffStatus = async () => {
    try {
      const q = query(
        collection(db, "staffAssignments"),
        where("staffEmail", "==", user.email)
      );
      const snapshot = await getDocs(q);
      setIsStaff(!snapshot.empty);
    } catch (error) {
      console.error("Error checking staff status:", error);
    }
  };

  // Xu ly khi chua login cho owner
  const handleOwnerFeaturePress = (featureName, screenName) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        `Bạn cần đăng nhập để sử dụng chức năng "${featureName}".`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
        ]
      );
    } else {
      // Đã đăng nhập, cho phép truy cập trực tiếp vì không có ràng buộc vai trò
      navigation.navigate(screenName);
    }
  };

  const handleStaffFeaturePress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để sử dụng chức năng này.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
        ]
      );
    } else if (!isStaff) {
      Alert.alert(
        "Thông báo",
        "Liên hệ với chủ bãi xe để trở thành nhân viên.",
        [{ text: "Đã hiểu" }]
      );
    } else {
      navigation.navigate("StaffTabs");
    }
  };

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có muốn thoát tài khoản?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Text style={styles.appTitle}>ParkingFinder</Text>
      </View>

      <View style={styles.content}>
        {isAuthenticated && user?.fullName ? (
          <Text style={styles.welcomeText}>Chào mừng {user.fullName}!</Text>
        ) : (
          <Text style={styles.welcomeText}>
            Chào mừng đến với ParkingFinder
          </Text>
        )}
        <Text style={styles.subWelcomeText}>
          Khám phá các tiện ích quản lý và tìm kiếm bãi đỗ xe.
        </Text>

        <View style={styles.roleButtonsContainer}>
          {/* Chức năng Tìm bãi đỗ xe - Luôn có thể truy cập */}
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => navigation.navigate("CustomerTabs")}
          >
            <View style={styles.buttonIconContainer}>
              <Car color="#3B82F6" size={28} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.roleButtonText}>Tìm bãi đỗ xe</Text>
              <Text style={styles.roleDescription}>
                Dễ dàng tìm kiếm và định vị bãi đỗ xe phù hợp.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Chức năng Đăng ký bãi xe */}
          <TouchableOpacity
            style={styles.roleButton} // Không còn style disable khi đã đăng nhập
            onPress={() =>
              handleOwnerFeaturePress("Quản lý bãi xe", "OwnerTabs")
            }
          >
            <View style={styles.buttonIconContainer}>
              <UserCircle color="#10B981" size={28} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.roleButtonText}>Quản lý bãi xe</Text>
              <Text style={styles.roleDescription}>
                Thiết lập và điều hành bãi đỗ xe của bạn hiệu quả.
              </Text>
            </View>
            {!isAuthenticated && (
              <View style={styles.loginRequiredPromptOnButton}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.loginRequiredPromptOnButtonText}>
                  Cần đăng nhập
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Chức năng Nhân viên bãi xe */}
          <TouchableOpacity
            style={styles.roleButton} // Không còn style disable khi đã đăng nhập
            onPress={handleStaffFeaturePress}
          >
            <View style={styles.buttonIconContainer}>
              <Users color="#F59E0B" size={28} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.roleButtonText}>Nhân viên bãi xe</Text>
              <Text style={styles.roleDescription}>
                Hỗ trợ ghi nhận xe ra vào và các nghiệp vụ tại bãi.
              </Text>
            </View>
            {!isAuthenticated && (
              <View style={styles.loginRequiredPromptOnButton}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.loginRequiredPromptOnButtonText}>
                  Cần đăng nhập
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginPrompt}
            onPress={() => navigation.navigate("Login")}
          >
            <LogIn size={20} color="#FFFFFF" />
            <Text style={styles.loginPromptText}>Đăng nhập</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 ParkingFinder</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Màu nền chung
  },
  header: {
    alignItems: "center",
    paddingVertical: 25,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4F46E5", // Màu chủ đạo
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20, // Thêm padding vertical
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#1F2937",
  },
  subWelcomeText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    color: "#6B7280",
    lineHeight: 22,
  },
  roleButtonsContainer: {
    gap: 18,
    marginBottom: 30,
  },
  roleButton: {
    backgroundColor: "#FFFFFF", // Nền trắng cho các nút
    borderRadius: 12,
    padding: 16,
    flexDirection: "row", // Icon và text nằm cùng hàng
    alignItems: "center", // Căn giữa theo chiều dọc
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: "relative", // Để định vị loginRequiredPromptOnButton
  },
  buttonIconContainer: {
    marginRight: 16,
    backgroundColor: "#EFF6FF", // Nền nhẹ cho icon
    padding: 10,
    borderRadius: 8,
  },
  buttonTextContainer: {
    flex: 1, // Cho phép text chiếm hết không gian còn lại
  },
  roleButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  roleDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 20,
  },
  loginRequiredPromptOnButton: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2", // Nền đỏ rất nhạt
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12, // Bo tròn
  },
  loginRequiredPromptOnButtonText: {
    fontSize: 11,
    color: "#DC2626", // Màu đỏ đậm hơn
    marginLeft: 4,
    fontWeight: "500",
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5", // Nút đăng nhập màu chủ đạo
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10, // Giảm margin top
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  loginPromptText: {
    fontSize: 16,
    color: "#FFFFFF", // Text trắng
    fontWeight: "600",
    marginLeft: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4444",
    marginLeft: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 13,
  },
});
