import Test from "@/components/Test";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-blue-800 text-2xl p-8 border-2">Edit app/index.tsx to edit this screen.</Text>
      <Test />
    </View>
  );
}
