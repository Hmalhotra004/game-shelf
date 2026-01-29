import { Alert, AlertTitle } from "@repo/ui/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";

interface Props {
  error: string;
}

const AlertError = ({ error }: Props) => {
  return (
    <Alert className="bg-destructive/10 border-none">
      <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
      <AlertTitle>{error}</AlertTitle>
    </Alert>
  );
};

export default AlertError;
