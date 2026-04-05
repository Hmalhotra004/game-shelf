import EmailVerificationView from "@repo/ui/views/auth/EmailVerificationView";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/email-verification")({
  validateSearch: (search) => {
    return {
      email: search.email as string,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();

  const navigate = useNavigate();

  const onSuccess = () => {
    navigate({ to: "/", replace: true });
  };

  return (
    <EmailVerificationView
      email={search.email}
      onSuccess={onSuccess}
    />
  );
}
