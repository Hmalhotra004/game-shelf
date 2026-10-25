import { FormInput, FormInputPassword } from "@/components/form/form";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/authClient";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupSchemaType } from "@repo/schemas/schemas/auth";
import { useRouter } from "expo-router";
import { LibraryIcon } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";

import {
  KeyboardAwareScrollView,
  KeyboardController,
} from "react-native-keyboard-controller";

const SignUp = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignupSchemaType) {
    setError(null);
    setPending(true);

    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.replace({ pathname: "/(tabs)" });
        },
        onError: ({ error: err }) => {
          setError(err.message);
        },
        onResponse: () => {
          setPending(false);
        },
      },
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAwareScrollView
        bottomOffset={250}
        contentContainerClassName="flex-grow pb-12 pt-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center pb-10 gap-2">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
            <LibraryIcon
              size={32}
              color={THEME[theme].background}
            />
          </View>

          <Text className="text-4xl font-extrabold tracking-tight text-foreground">
            Create account
          </Text>

          <Text className="-mt-1 text-center text-base text-muted-foreground">
            Start tracking every game you own, play and finish.
          </Text>
        </View>

        <View className="gap-4 pr-1">
          <FormInput
            name="name"
            control={form.control}
            autoFocus
            placeholder="Name"
            autoComplete="name"
            disabled={pending}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => KeyboardController.setFocusTo("next")}
          />

          <FormInput
            name="email"
            control={form.control}
            placeholder="Email"
            keyboardType="email-address"
            autoComplete="email"
            disabled={pending}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => KeyboardController.setFocusTo("next")}
          />

          <FormInputPassword
            name="password"
            control={form.control}
            placeholder="Password"
            disabled={pending}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => KeyboardController.setFocusTo("next")}
          />

          <FormInputPassword
            name="confirmPassword"
            control={form.control}
            placeholder="Confirm password"
            disabled={pending}
            returnKeyType="done"
            onSubmitEditing={form.handleSubmit(onSubmit)}
          />

          {error && (
            <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          )}

          <Button
            size="lg"
            onPress={form.handleSubmit(onSubmit)}
            disabled={pending}
          >
            {pending ? (
              <Loader />
            ) : (
              <Text className="text-base font-bold">Sign up</Text>
            )}
          </Button>

          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Already have an account?
            </Text>
            <Pressable
              onPress={() => router.back()}
              disabled={pending}
              hitSlop={8}
            >
              <Text className="text-sm font-semibold text-primary">Log in</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default SignUp;
