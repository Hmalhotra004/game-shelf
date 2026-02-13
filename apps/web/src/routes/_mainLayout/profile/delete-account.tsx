import { authClient } from "@repo/ui/lib/authClient";
import { verifySession } from "@repo/ui/lib/verifySession";
import { DeleteAccountView } from "@repo/ui/views/profile/DeleteAccountView";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/profile/delete-account")({
  beforeLoad: async () => {
    const session = await verifySession();

    if (!session) {
      throw redirect({ to: "/login", replace: true });
    }

    if (!session.user.emailVerified) {
      throw redirect({
        to: "/email-verification",
        search: { email: session.user.email },
        replace: true,
      });
    }

    return session.user;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useRouteContext();

  const navigate = Route.useNavigate();
  const router = useRouter();

  const logout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/login", replace: true }),
      },
    });
  };

  return (
    <DeleteAccountView
      email={email}
      onSuccess={logout}
      onCancel={() => router.history.back()}
    />
  );
}
