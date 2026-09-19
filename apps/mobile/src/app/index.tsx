import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-white">
        Edit src/app/index.tsx to edit this screen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
