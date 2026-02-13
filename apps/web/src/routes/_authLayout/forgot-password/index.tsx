import { verifySession } from "@repo/ui/lib/verifySession";
import { ForgotPasswordView } from "@repo/ui/views/auth/ForgotPasswordView";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/forgot-password/")({
  beforeLoad: async () => {
    const session = await verifySession();

    if (session?.session.id && session.user.id) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const router = useRouter();

  return (
    <ForgotPasswordView
      onSuccess={(email) =>
        navigate({ to: "/forgot-password/verify-otp", search: { email } })
      }
      onCancel={() => router.history.back()}
    />
  );
}
