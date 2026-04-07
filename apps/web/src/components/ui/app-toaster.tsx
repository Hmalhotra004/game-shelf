import { useTheme } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      closeButton
      theme={theme}
    />
  );
}
