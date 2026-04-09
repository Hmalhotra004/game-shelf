import AlertError from "@/components/AlertError";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@repo/schemas/schemas/auth";
import useOTPExpire from "@repo/utils/hooks/useOTPExpire";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormData = z.infer<typeof otpSchema>;

export const Route = createFileRoute("/_authLayout/email-verification")({
  validateSearch: (search) => {
    return {
      email: search.email as string,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { email } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    async function sent() {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      setOtpSent(true);
    }
    if (!otpSent) {
      sent();
    }
  }, [email, otpSent]);

  const { isExpired, minutes, seconds, reset } = useOTPExpire();

  const form = useForm<FormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: FormData) {
    setPending(true);

    authClient.emailOtp.checkVerificationOtp({
      email,
      type: "email-verification",
      otp: data.pin,
      fetchOptions: {
        onSuccess: () => {
          authClient.emailOtp.verifyEmail({
            email,
            otp: data.pin,
            fetchOptions: {
              onSuccess: () => {
                setPending(false);
                navigate({ to: "/", replace: true });
              },
              onError: ({ error }) => {
                setPending(false);
                setError(error.message);
              },
            },
          });
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    });
  }

  return (
    <Card className="w-full h-full md:w-121.5 border-2 shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          Please enter the one-time password sent to <br />
          {email}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3"
        >
          <Controller
            name="pin"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col items-center gap-3 w-full">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  {...field}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, idx) => (
                      <InputOTPSlot
                        key={idx}
                        index={idx}
                        aria-invalid={fieldState.invalid}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <div className="flex flex-col items-center text-sm text-muted-foreground gap-1">
                  <span>
                    OTP expires in{" "}
                    <span className="font-semibold text-foreground">
                      {minutes}:{seconds}
                    </span>
                  </span>

                  <Button
                    variant="ghost"
                    disabled={!isExpired}
                    size="sm"
                    onClick={async () => {
                      await authClient.emailOtp.sendVerificationOtp({
                        email,
                        type: "email-verification",
                        fetchOptions: {
                          onSuccess: () => reset(),
                          onError: ({ error }) => setError(error.message),
                        },
                      });
                    }}
                  >
                    Resend OTP
                  </Button>
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </div>
            )}
          />

          {!!error && <AlertError error={error} />}

          <Button
            type="submit"
            disabled={pending}
            className="w-full"
          >
            {pending ? <Spinner /> : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
