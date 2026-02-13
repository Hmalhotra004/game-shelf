import { emailSchema } from "@repo/schemas/schemas/auth";
import { ChangePasswordView } from "@repo/ui/views/auth/ChangePasswordView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authLayout/forgot-password/change-password",
)({
  validateSearch: emailSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  return (
    <ChangePasswordView
      email={searchParams.email}
      title="Forgot Password"
      onSuccess={() => navigate({ to: "/login", replace: true })}
      onCancel={() => navigate({ to: "/login", replace: true })}
    />
  );
}
