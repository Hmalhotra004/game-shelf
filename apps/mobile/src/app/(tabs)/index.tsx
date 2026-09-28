import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center">
        <Text>Edit src/app/index.tsx to edit this screen.</Text>
        <Button>
          <Text>hello</Text>
        </Button>
      </View>
    </ScreenWrapper>
  );
}
