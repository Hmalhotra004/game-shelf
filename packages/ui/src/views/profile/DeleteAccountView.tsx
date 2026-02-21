import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@repo/schemas/schemas/auth";
import AlertError from "@repo/ui/components/AlertError";
import { FormInputPassword } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { api } from "@repo/ui/lib/api";
import { authClient } from "@repo/ui/lib/authClient";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

interface Props {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DeleteAccountView = ({ email, onSuccess, onCancel }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const deleteUser = useMutation({
    mutationFn: async () => {
      await api.delete(`/user/deleteAccount`);
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      onSuccess();
    },
    onError: (e) => {
      setPending(false);
      if (isAxiosError(e)) {
        toast.error(e.response?.data.error || "Failed to delete account");
      }
    },
  });

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
        email: email,
        password: values.confirmPassword,
      },
      {
        onSuccess: () => {
          deleteUser.mutate();
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      },
    );
  }

  return (
    <Card className="w-full h-full md:w-121.5 border-none shadow-none mx-auto">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Delete Account</CardTitle>
        <CardDescription>
          Enter your account password to delete account permanently.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormInputPassword
            name="password"
            control={form.control}
            placeholder="Password"
            disabled={pending}
          />

          <FormInputPassword
            name="confirmPassword"
            control={form.control}
            placeholder="Confirm Password"
            disabled={pending}
          />

          {!!error && <AlertError error={error} />}

          <Button
            variant="ghost"
            className="w-full"
            type="button"
            disabled={pending}
            onClick={() => {
              if (pending) return;
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="lg"
            type="submit"
            className="w-full"
            disabled={pending}
          >
            {pending ? <Spinner /> : "Delete Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
