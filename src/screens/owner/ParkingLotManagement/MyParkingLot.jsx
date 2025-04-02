import { View, Text, Button, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../../firebaseConfig";
import { collection, query, getDocs, limit } from "firebase/firestore";

import parkinglotImg from "../../../../assets/images/parkinglot.webp";

export default function MyParkingLot() {
  const navigation = useNavigation();

  const parkingLotsRef = collection(db, "parking lots");

  const [parkingLot, setParkingLot] = useState(null);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const q = query(parkingLotsRef, limit(1)); // Đúng cú pháp
        const querySnapshot = await getDocs(q); // Dùng getDocs() thay vì getDoc()

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            console.log(doc.data()); // Kiểm tra dữ liệu
            setParkingLot(doc.data());
          });
        } else {
          console.log("Không có dữ liệu!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ Firestore:", error);
      }
    };
    fetchParking();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {!parkingLot ? (
        <Button
          title="Đăng ký bãi đỗ"
          onPress={() => navigation.navigate("RegisterParkingLot")}
        />
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate("EditParkingLot")}>
          <View
            style={{
              padding: 15,
              backgroundColor: "#f8f8f8",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: parkingLot.image }}
              style={{ width: 200, height: 150, borderRadius: 10 }}
            />
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
            >
              {parkingLot.name}
            </Text>
            <Text>{parkingLot.location}</Text>
            <Text>Số chỗ: {parkingLot.spots}</Text>
            <Text>Loại bãi: {parkingLot.type}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
