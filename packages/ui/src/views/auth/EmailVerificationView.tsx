import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@repo/schemas/schemas/auth.schema";
import AlertError from "@repo/ui/components/AlertError";
import { Button } from "@repo/ui/components/ui/button";
import { FieldError } from "@repo/ui/components/ui/field";
import { Spinner } from "@repo/ui/components/ui/spinner";
import useOTPExpire from "@repo/ui/hooks/useOTPExpire";
import { authClient } from "@repo/ui/lib/authClient";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

interface Props {
  onSuccess: () => void;
  email: string;
}

type FormData = z.infer<typeof otpSchema>;

const EmailVerificationView = ({ email, onSuccess }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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
                onSuccess();
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
    <Card className="w-full h-full md:w-[486px] border-2 shadow-none">
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
};

export default EmailVerificationView;
