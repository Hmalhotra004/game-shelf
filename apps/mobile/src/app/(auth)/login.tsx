import { authClient } from "@/lib/authClient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, View } from "react-native";

export default function Login() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function click() {
    await authClient.signIn.email(
      {
        email: "hmalhotra2004@gmail.com",
        password: "TLOU@123",
      },
      {
        onSuccess: () => {
          router.replace("/(tabs)");
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
    <View>
      <Text>Login Page</Text>
      <Button
        onPress={click}
        title="Login"
        disabled={pending}
      />
      {!!error && <Text>{error}</Text>}
    </View>
  );
}
