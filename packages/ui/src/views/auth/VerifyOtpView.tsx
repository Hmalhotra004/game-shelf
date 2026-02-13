import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@repo/schemas/schemas/auth";
import AlertError from "@repo/ui/components/AlertError";
import { Button } from "@repo/ui/components/ui/button";
import { FieldError } from "@repo/ui/components/ui/field";
import { Spinner } from "@repo/ui/components/ui/spinner";
import useOTPExpire from "@repo/ui/hooks/useOTPExpire";
import { authClient } from "@repo/ui/lib/authClient";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import z from "zod";

interface Props {
  email: string;
  onSuccess: (email: string) => void;
  onCancel: () => void;
}

type FormData = z.infer<typeof otpSchema>;

export const VerifyOtpView = ({ email, onSuccess, onCancel }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { isExpired, minutes, seconds, reset } = useOTPExpire();

  const form = useForm<FormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function onSubmit(data: FormData) {
    setPending(true);
    setError(null);

    await authClient.emailOtp.checkVerificationOtp({
      email: email,
      type: "forget-password",
      otp: data.pin,
      fetchOptions: {
        onSuccess: () => {
          localStorage.setItem("otp", JSON.stringify(data.pin));
          onSuccess(email);
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
                        email: email,
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
            {pending ? <Spinner /> : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
