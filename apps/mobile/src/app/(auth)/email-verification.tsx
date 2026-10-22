import { FormOTPInput } from "@/components/form/form";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/authClient";
import { refreshSession } from "@/lib/refreshSession";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema, OTPSchemaType } from "@repo/schemas/schemas/auth";
import { OTP_LENGTH } from "@repo/utils/constants";
import useOTPExpire from "@repo/utils/hooks/useOTPExpire";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const EmailVerification = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { isPending, session } = useSession();
  const { isExpired, minutes, seconds, reset } = useOTPExpire();

  const sentRef = useRef(false);

  const email = session?.user.email ?? "";

  const sendOtp = useCallback(async () => {
    setError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    if (error) setError(error.message ?? "Failed to send code");
    else reset();
  }, [email, reset]);

  // send once on mount; ref guards StrictMode double-fire and re-renders
  useEffect(() => {
    if (!email || sentRef.current) return;
    sentRef.current = true;
    sendOtp();
  }, [email, sendOtp]);

  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: OTPSchemaType) {
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
                // setPending(false);
                refreshSession();
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

  if (isPending)
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <Loader size={30} />
        </View>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <KeyboardAwareScrollView
        contentContainerClassName="flex-grow pb-12 pt-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center gap-6">
          <View className="items-center gap-2">
            <Text className="text-2xl font-bold">Verify your email</Text>
            <Text className="text-center text-muted-foreground">
              Enter the {OTP_LENGTH}-digit code sent to{"\n"}
              <Text className="font-semibold">{email}</Text>
            </Text>
          </View>

          <FormOTPInput
            name="pin"
            control={form.control}
            disabled={pending}
            onValueChange={() => error && setError(null)}
            onComplete={() => form.handleSubmit(onSubmit)()}
            autoFocus
          />

          {error && (
            <Text className="text-destructive text-center">{error}</Text>
          )}

          <Button
            className="w-full"
            disabled={pending || form.watch("pin").length !== OTP_LENGTH}
            onPress={form.handleSubmit(onSubmit)}
          >
            {pending ? <Loader size={20} /> : <Text>Verify</Text>}
          </Button>

          <View className="items-center gap-1">
            {isExpired ? (
              <Pressable
                onPress={sendOtp}
                disabled={pending}
              >
                <Text className="font-semibold text-primary">Resend code</Text>
              </Pressable>
            ) : (
              <Text className="text-muted-foreground">
                Resend in {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default EmailVerification;
