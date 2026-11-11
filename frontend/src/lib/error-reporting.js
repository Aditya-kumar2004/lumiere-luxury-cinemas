export function reportRuntimeError(error, context = {}) {
  if (typeof window === "undefined") return;
  console.error("[Runtime Error]", error, context);
  window.__errorEvents?.captureException?.(error, {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  });
}

const MAX_SERIALIZED_LENGTH = 2000;

function describeThrown(error) {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  const { message } = error ?? {};
  if (typeof message === "string" && message.length > 0) return message;
  try {
    return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
  } catch {
    return String(error);
  }
}
