import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@repo/schemas/schemas/auth";
import AlertError from "@repo/ui/components/AlertError";
import { FormInputPassword } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { FieldGroup } from "@repo/ui/components/ui/field";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { authClient } from "@repo/ui/lib/authClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { toast } from "sonner";

interface Props {
  email: string;
  title: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type FormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordView = ({
  email,
  onCancel,
  onSuccess,
  title,
}: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const otp = JSON.parse(localStorage.getItem("otp") || "{}");

  const form = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormData) {
    setPending(true);
    setError(null);

    await authClient.emailOtp.resetPassword(
      {
        email,
        password: data.confirmPassword,
        otp,
      },
      {
        onSuccess: () => {
          localStorage.removeItem("otp");
          toast.success("Password changed successfully");
          setPending(false);
          onSuccess();
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    );
  }

  return (
    <Card className="w-full h-full md:w-121.5 border-2 shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>Please enter new password.</CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <FormInputPassword
              name="password"
              control={form.control}
              disabled={pending}
              placeholder="Password"
            />

            <FormInputPassword
              name="confirmPassword"
              control={form.control}
              disabled={pending}
              placeholder="Confirm Password"
            />

            {!!error && <AlertError error={error} />}

            <Button
              variant="ghost"
              type="button"
              disabled={pending}
              className="w-full"
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={pending}
              className="w-full"
            >
              {pending ? <Spinner /> : "Reset Password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
