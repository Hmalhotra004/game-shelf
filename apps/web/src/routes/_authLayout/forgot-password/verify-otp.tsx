import { emailSchema } from "@repo/schemas/schemas/auth";
import { VerifyOtpView } from "@repo/ui/views/auth/VerifyOtpView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/forgot-password/verify-otp")(
  {
    validateSearch: emailSchema,
    component: RouteComponent,
  },
);

function RouteComponent() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <VerifyOtpView
      email={searchParams.email}
      onSuccess={(email) =>
        navigate({ to: "/forgot-password/change-password", search: { email } })
      }
      onCancel={() => navigate({ to: "/login", replace: true })}
    />
  );
}
