export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    event: name,
    properties,
    timestamp: new Date().toISOString(),
  };

  console.info("analytics", payload);
}
