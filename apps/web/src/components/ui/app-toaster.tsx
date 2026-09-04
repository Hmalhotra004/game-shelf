import { Toaster } from "sonner";

import { useTheme } from "@/components/ThemeProvider";

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
