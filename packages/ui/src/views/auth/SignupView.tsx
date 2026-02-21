import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@repo/schemas/schemas/auth";
import AlertError from "@repo/ui/components/AlertError";
import { FormInput, FormInputPassword } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { FieldGroup } from "@repo/ui/components/ui/field";
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

type FormData = z.infer<typeof signupSchema>;

interface Props {
  onSuccess: () => void;
  renderLink?: (children: React.ReactNode) => React.ReactNode;
}

const SignupView = ({ renderLink, onSuccess }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormData) {
    setError(null);
    setPending(true);

    await authClient.signUp.email(
      {
        email: values.email,
        name: values.name,
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
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
      </CardHeader>

      <div className="px-7">
        <Separator />
      </div>

      <CardContent className="px-7">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">
            <FormInput
              name="name"
              control={form.control}
              type="text"
              placeholder="Name"
              disabled={pending}
            />

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
            />

            <FormInputPassword
              name="confirmPassword"
              control={form.control}
              placeholder="Confirm Password"
              disabled={pending}
            />

            {!!error && <AlertError error={error} />}

            <Button
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending ? <Spinner /> : "Sign Up"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardContent className="px-7 flex items-center justify-center">
        <p>
          Already have an account?{" "}
          {renderLink ? (
            renderLink(<span className="text-primary">log In</span>)
          ) : (
            <span className="text-primary">log In</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default SignupView;
