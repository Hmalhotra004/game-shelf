import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Button>
        <Text>hello</Text>
      </Button>
    </View>
  );
}
