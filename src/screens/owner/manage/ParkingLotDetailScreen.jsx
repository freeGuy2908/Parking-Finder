import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  MapPin,
  DollarSign,
  Car,
  FileText,
  Clock,
  BadgeAlert,
  Users,
  Trash2,
  Plus,
} from "lucide-react-native";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

export default function ParkingLotDetailScreen() {
  const route = useRoute();
  const { lot } = route.params;
  const [staffList, setStaffList] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing staff when component mounts
  useEffect(() => {
    fetchStaffList();
  }, [lot.id]);

  const fetchStaffList = async () => {
    try {
      const q = query(
        collection(db, "staffAssignments"),
        where("parkingLotId", "==", lot.id)
      );
      const snapshot = await getDocs(q);
      const staffEmails = snapshot.docs.map((doc) => doc.data().staffEmail);
      setStaffList(staffEmails);
    } catch (error) {
      console.error("Error fetching staff:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách nhân viên");
    }
  };

  const handleAddStaff = async () => {
    if (!newEmail.trim()) return;

    setLoading(true);
    try {
      // Check if email exists in users collection
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", newEmail.trim()));
      const userSnapshot = await getDocs(q);

      if (userSnapshot.empty) {
        Alert.alert("Lỗi", "Email này chưa đăng ký tài khoản");
        setLoading(false);
        return;
      }

      const userData = userSnapshot.docs[0].data();
      const userId = userSnapshot.docs[0].id;

      // Kiểm tra nhân viên đã làm ở bãi đỗ nào khác chưa (theo staffEmail hoặc staffId)
      const staffRef = collection(db, "staffAssignments");
      const staffEmailQ = query(
        staffRef,
        where("staffEmail", "==", newEmail.trim())
      );
      const staffEmailSnapshot = await getDocs(staffEmailQ);

      const staffIdQ = query(staffRef, where("staffId", "==", userId));
      const staffIdSnapshot = await getDocs(staffIdQ);

      if (!staffEmailSnapshot.empty && !staffIdSnapshot.empty) {
        Alert.alert("Lỗi", "Nhân viên này đã làm ở một bãi đỗ khác.");
        setLoading(false);
        return;
      }

      // Add staff assignment
      await addDoc(collection(db, "staffAssignments"), {
        parkingLotId: lot.id,
        parkingLotName: lot.name,
        staffEmail: newEmail.trim(),
        staffId: userId,
        createdAt: new Date().toISOString(),
      });

      // Update user's staffAt array
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        staffAt: [...(userData.staffAt || []), lot.id],
      });

      // Cập nhật trường staffs trong parkingLots
      const lotRef = doc(db, "parkingLots", lot.id);
      await updateDoc(lotRef, {
        staffs: [...(lot.staffs || []), newEmail.trim()],
      });

      Alert.alert("Thành công", "Đã thêm nhân viên vào bãi đỗ");
      setNewEmail("");
      fetchStaffList();
    } catch (error) {
      console.error("Error adding staff:", error);
      Alert.alert("Lỗi", "Không thể thêm nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (email) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa nhân viên này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            // Delete staff assignment
            const staffRef = collection(db, "staffAssignments");
            const q = query(
              staffRef,
              where("parkingLotId", "==", lot.id),
              where("staffEmail", "==", email)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              const docId = snapshot.docs[0].id;
              await deleteDoc(doc(db, "staffAssignments", docId));

              // Update user's staffAt array
              const userQ = query(
                collection(db, "users"),
                where("email", "==", email)
              );
              const userSnapshot = await getDocs(userQ);
              if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                const userData = userSnapshot.docs[0].data();
                await updateDoc(doc(db, "users", userId), {
                  staffAt: userData.staffAt.filter((id) => id !== lot.id),
                });
              }
            }

            fetchStaffList();
            Alert.alert("Thành công", "Đã xóa nhân viên khỏi bãi đỗ");
          } catch (error) {
            console.error("Error removing staff:", error);
            Alert.alert("Lỗi", "Không thể xóa nhân viên");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: lot.images[0] }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{lot.name}</Text>

        <View style={styles.infoRow}>
          <MapPin size={18} color="#4F46E5" />
          <Text style={styles.infoText}>{lot.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <DollarSign size={18} color="#4F46E5" />
          <Text style={styles.infoText}>{lot.pricePerHour} VND / giờ</Text>
        </View>

        <View style={styles.infoRow}>
          <Car size={18} color="#4F46E5" />
          <Text style={styles.infoText}>Tổng số chỗ: {lot.totalSpots}</Text>
        </View>

        <View style={styles.infoRow}>
          <FileText size={18} color="#4F46E5" />
          <Text style={styles.infoText}>Mô tả: {lot.description}</Text>
        </View>

        {/* <View style={styles.infoRow}>
          <Clock size={18} color="#4F46E5" />
          <Text style={styles.infoText}>
            Tạo lúc: {lot.createdAt.toDate().toLocaleString()}
          </Text>
        </View> */}
      </View>

      <View style={styles.staffSection}>
        <View style={styles.staffTitleRow}>
          <Users size={18} color="#4F46E5" />
          <Text style={styles.staffTitle}>Danh sách nhân viên</Text>
        </View>

        {staffList.map((email, index) => (
          <View key={index} style={styles.staffItem}>
            <Text>{email}</Text>
            <TouchableOpacity onPress={() => handleRemoveStaff(email)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addStaff}>
          <TextInput
            style={styles.input}
            placeholder="Nhập email nhân viên"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.activeVehiclesSection}>
        <View style={styles.staffTitleRow}>
          <Car size={18} color="#4F46E5" />
          <Text style={styles.staffTitle}>Xe đang gửi trong bãi</Text>
        </View>
        {lot.activeVehicles && lot.activeVehicles.length > 0 ? (
          lot.activeVehicles.map((plate, idx) => (
            <View key={plate + idx} style={styles.activeVehicleItem}>
              <Text style={styles.plateText}>
                {idx + 1}. {plate}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noActiveVehicleText}>
            Không có xe nào đang gửi.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 200 },
  infoContainer: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: { marginLeft: 8, fontSize: 14, color: "#374151" },
  staffSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  staffTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  staffTitle: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  staffItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  addStaff: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  activeVehiclesSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#F3F4F6",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 12,
  },
  activeVehicleItem: {
    paddingVertical: 8,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  plateText: {
    fontSize: 15,
    color: "#1F2937",
  },
  noActiveVehicleText: {
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
});
