import { View, TextInput, Button, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { db } from "../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function RegisterParkingLot() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [spots, setSpots] = useState("");
  const [type, setType] = useState("");

  const navigation = useNavigation();

  const parkingLotsRef = collection(db, "parking lots");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveParkingLot = async () => {
    await addDoc(parkingLotsRef, {
      name,
      location,
      image,
      spots,
      type,
    });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Tên bãi đỗ"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Địa chỉ"
        value={location}
        onChangeText={setLocation}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Chọn ảnh" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 150, marginTop: 10 }}
        />
      )}
      <TextInput
        placeholder="Số chỗ"
        value={spots}
        onChangeText={setSpots}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Picker
        selectedValue={type}
        onValueChange={(itemValue, itemIndex) => setType(itemValue)}
      >
        <Picker.Item label="Xe máy" value="xe máy" />
        <Picker.Item label="Ô tô" value="ô tô" />
      </Picker>
      <Button title="Lưu" onPress={saveParkingLot} />
    </View>
  );
}
