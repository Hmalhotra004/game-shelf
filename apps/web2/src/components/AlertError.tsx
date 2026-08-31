import { OctagonAlertIcon } from "lucide-react";

import { Alert, AlertTitle } from "@/components/ui/alert";

interface Props {
  error: string;
}

const AlertError = ({ error }: Props) => {
  return (
    <Alert className="bg-destructive/10 border-none">
      <OctagonAlertIcon className="size-4 text-destructive!" />
      <AlertTitle>{error}</AlertTitle>
    </Alert>
  );
};

export default AlertError;
