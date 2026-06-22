type LogContext = Record<string, string | number | boolean | null | undefined>;

const isDevelopment = import.meta.env.DEV;

function safeContext(context?: LogContext) {
  if (!context) return undefined;
  return Object.fromEntries(
    Object.entries(context).filter(([key]) => !key.toLowerCase().includes("password")),
  );
}

export const debugLog = {
  warn(message: string, context?: LogContext) {
    console.warn(`[DDT Tracker] ${message}`, safeContext(context) ?? "");
  },
  dev(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.info(`[DDT Tracker] ${message}`, safeContext(context) ?? "");
    }
  },
};
