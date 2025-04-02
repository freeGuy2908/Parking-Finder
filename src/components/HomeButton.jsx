import { TouchableOpacity, StyleSheet } from "react-native";
import { Home } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeButton() {
  const navigation = useNavigation();

  const goToHome = () => {
    navigation.replace("HomeScreen");
  };

  return (
    <TouchableOpacity style={styles.button} onPress={goToHome}>
      <Home size={24} color="#4F46E5" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
});
