import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@repo/schemas/schemas/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

const login = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();

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
      <View>
        <Text>login</Text>

        <Controller
          name="email"
          control={form.control}
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <>
              <Input
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!pending}
              />
              {fieldState.error && <Text>{fieldState.error.message}</Text>}
            </>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <>
              <Input
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="password"
                editable={!pending}
              />
              {fieldState.error && <Text>{fieldState.error.message}</Text>}
            </>
          )}
        />

        {error && (
          <View>
            <Text>{error}</Text>
          </View>
        )}

        <Button
          onPress={form.handleSubmit(onSubmit)}
          disabled={pending}
        >
          <Text>Login</Text>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default login;
