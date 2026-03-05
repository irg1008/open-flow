import { m } from "@/i18n/_generated/messages";
import { ErrorRouteComponent } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

const MAX_RETRY_ATTEMPTS = 3;
let retryAttempt = 0;

export const ErrorComponent: ErrorRouteComponent = ({ error, reset }) => {
  const handleRetry = () => {
    retryAttempt += 1;
    reset();
  };

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{m.error_generic()}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      {typeof error.cause === "string" && <AlertDescription>{error.cause}</AlertDescription>}

      <AlertAction>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={retryAttempt >= MAX_RETRY_ATTEMPTS}
          className="ml-auto"
        >
          {m.error_generic_action()}
        </Button>
      </AlertAction>
    </Alert>
  );
};
