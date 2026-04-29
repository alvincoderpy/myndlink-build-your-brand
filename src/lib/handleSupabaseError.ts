import { toast } from "sonner";

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallbackMessage;
}

export function handleSupabaseError(error: unknown, fallbackMessage: string): void {
  if (!error) {
    return;
  }

  console.error(fallbackMessage, error);
  toast.error(getErrorMessage(error, fallbackMessage));
}

