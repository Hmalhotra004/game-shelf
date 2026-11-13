import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { getErrorDescription } from "@repo/utils/lib/utils";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { View } from "react-native";

cssInterop(AlertCircleIcon, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(RefreshCwIcon, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

interface Props {
  refetch: () => void;
  error: Error | null;
}

export const ErrorState = ({ refetch, error }: Props) => {
  const description = getErrorDescription(error);

  return (
    <View
      accessibilityRole="alert"
      className="w-full flex-row gap-3 rounded-lg border border-destructive/50 bg-card p-4"
    >
      <AlertCircleIcon
        size={18}
        // className={cn("text-destructive", description && "mt-1.5")}
        className={cn("text-destructive")}
      />

      <View className="flex-1 gap-1">
        <Text className="text-sm font-medium leading-none tracking-tight text-destructive">
          Failed to load save data
        </Text>

        <Text className="text-sm text-muted-foreground">{description}</Text>

        <Button
          variant="outline"
          onPress={() => refetch()}
        >
          <RefreshCwIcon
            size={14}
            className="text-foreground"
          />
          <Text className="text-sm font-medium">Try again</Text>
        </Button>
      </View>
    </View>
  );
};
