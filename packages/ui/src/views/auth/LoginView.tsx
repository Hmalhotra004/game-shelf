import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@repo/schemas/schemas/auth";
import AlertError from "@repo/ui/components/AlertError";
import { FormInput, FormInputPassword } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { FieldDescription, FieldGroup } from "@repo/ui/components/ui/field";
import { Separator } from "@repo/ui/components/ui/separator";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { authClient } from "@repo/ui/lib/authClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

type FormData = z.infer<typeof loginSchema>;

interface Props {
  onSuccess: () => void;
  renderForgotLink?: (children: React.ReactNode) => React.ReactNode;
  rendersignLink?: (children: React.ReactNode) => React.ReactNode;
}

const LoginView = ({ onSuccess, renderForgotLink, rendersignLink }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormData) {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: ({ error }) => {
          setError(error.message);
        },
        onResponse: () => {
          setPending(false);
        },
      },
    );
  }

  return (
    <Card className="w-full h-full md:w-121.5 max-sm:w-85 sm:w-100">
      <CardHeader className="flex items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Welcome back!</CardTitle>
      </CardHeader>

      <div className="px-7">
        <Separator />
      </div>

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

            <FormInputPassword
              name="password"
              control={form.control}
              placeholder="Password"
              disabled={pending}
              outerElement={
                <FieldDescription>
                  {renderForgotLink ? (
                    renderForgotLink(<span>Forgot Password?</span>)
                  ) : (
                    <span>Forgot Password?</span>
                  )}
                </FieldDescription>
              }
            />

            {!!error && <AlertError error={error} />}

            <Button
              size="lg"
              className="w-full"
              disabled={pending}
              type="submit"
            >
              {pending ? <Spinner /> : "Log In"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardContent className="px-7 flex items-center justify-center">
        <p>
          Don&apos;t have an account?{" "}
          {rendersignLink ? (
            rendersignLink(<span className="text-primary">Sign Up</span>)
          ) : (
            <span className="text-primary">Sign Up</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginView;
