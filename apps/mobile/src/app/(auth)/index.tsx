import { FormInput, FormInputPassword } from "@/components/form/form";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/authClient";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@repo/schemas/schemas/auth";
import { useRouter } from "expo-router";
import { LibraryIcon } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";

const login = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginSchemaType) {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
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
      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-8 pt-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center pb-10">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
            <LibraryIcon
              size={32}
              color={THEME[theme].primary}
            />
          </View>

          <Text className="text-4xl font-extrabold tracking-tight text-foreground">
            GameShelf
          </Text>

          <Text className="mt-2 text-center text-base text-muted-foreground">
            Every game you own, play and finish — in one place.
          </Text>
        </View>

        {/* Form — pinned to the bottom */}
        <View className="gap-4">
          <FormInput
            name="email"
            control={form.control}
            autoFocus
            placeholder="Email"
            keyboardType="email-address"
            autoComplete="email"
            disabled={pending}
          />

          <FormInputPassword
            name="password"
            control={form.control}
            placeholder="Password"
            disabled={pending}
          />

          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            disabled={pending}
            hitSlop={8}
            className="self-end"
          >
            <Text className="text-sm font-medium text-primary">
              Forgot password?
            </Text>
          </Pressable>

          {error && (
            <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          )}

          <Button
            onPress={form.handleSubmit(onSubmit)}
            disabled={pending}
            className="h-14 rounded-2xl"
          >
            {pending ? (
              <Loader />
            ) : (
              <Text className="text-base font-bold">Log in</Text>
            )}
          </Button>

          <Text className="mt-2 text-center text-xs text-muted-foreground">
            Steam · PlayStation · Xbox · Epic
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default login;
