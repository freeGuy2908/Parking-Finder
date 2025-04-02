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
import { Car, UserCircle, Users } from "lucide-react-native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Image
          source={{ uri: "https://placeholder.svg?height=80&width=80" }}
          style={styles.logo}
        />
        <Text style={styles.appTitle}>Parking Finder</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Chào mừng đến với ứng dụng quản lý và tìm bãi đỗ xe
        </Text>

        <View style={styles.roleButtonsContainer}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => navigation.navigate("CustomerTabs")}
          >
            <Car color="#4F46E5" size={32} />
            <Text style={styles.roleButtonText}>Tìm bãi đỗ xe</Text>
            <Text style={styles.roleDescription}>
              Tìm kiếm bãi đỗ xe gần bạn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => navigation.navigate("OwnerTabs")}
          >
            <UserCircle color="#4F46E5" size={32} />
            <Text style={styles.roleButtonText}>Đăng ký bãi xe</Text>
            <Text style={styles.roleDescription}>
              Quản lý bãi đỗ xe của bạn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => navigation.navigate("StaffTabs")}
          >
            <Users color="#4F46E5" size={32} />
            <Text style={styles.roleButtonText}>Nhân viên bãi xe</Text>
            <Text style={styles.roleDescription}>Quản lý xe ra vào bãi</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#ffffff",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: "#4F46E5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    color: "#1F2937",
  },
  roleButtonsContainer: {
    gap: 20,
  },
  roleButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 20,
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  roleButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#1F2937",
  },
  roleDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#9CA3AF",
  },
});
