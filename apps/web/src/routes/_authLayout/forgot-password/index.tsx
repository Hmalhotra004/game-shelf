import AlertError from "@/components/AlertError";
import { FormInput } from "@/components/form/Form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@repo/schemas/schemas/auth";
import { authCheckEmailMutationOptions } from "@repo/utils/mutations/auth";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_authLayout/forgot-password/")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (session.data?.session.id && session.data?.user.id) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const navigate = Route.useNavigate();
  const router = useRouter();

  const checkEmail = useMutation(
    authCheckEmailMutationOptions(setError, setPending),
  );

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    setError(null);
    setPending(true);

    await checkEmail.mutateAsync(values.email);

    await authClient.emailOtp.sendVerificationOtp(
      {
        email: values.email,
        type: "forget-password",
      },
      {
        onSuccess: () => {
          setPending(false);
          navigate({
            to: "/forgot-password/verify-otp",
            search: { email: values.email },
          });
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      },
    );
  }

  return (
    <Card className="w-full h-full md:w-121.5 max-sm:w-85 sm:w-100">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter the email associated with your account for verification
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <FormInput
              name="email"
              control={form.control}
              type="email"
              autoComplete="email"
              placeholder="Email"
              disabled={pending}
            />

            {!!error && <AlertError error={error} />}

            <Button
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending ? <Spinner /> : "Send OTP"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="mx-auto">
        <Button
          variant="link"
          onClick={() => router.history.back()}
        >
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}
