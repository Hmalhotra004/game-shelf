import { Button, type buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { VariantProps } from "class-variance-authority";
import { useState } from "react";
import { View } from "react-native";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const useConfirmDialog = (
  title: string,
  message: string,
  variant: VariantProps<typeof buttonVariants>["variant"] = "default",
): [() => React.JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => setPromise(null);

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog
      open={promise !== null}
      onOpenChange={handleClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Text>{title}</Text>
          </DialogTitle>
          <DialogDescription>
            <Text>{message}</Text>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <View className="flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onPress={handleCancel}
            >
              <Text>Cancel</Text>
            </Button>

            <Button
              variant={variant}
              onPress={handleConfirm}
            >
              <Text>Confirm</Text>
            </Button>
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
