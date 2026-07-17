export interface AdminAccessContext {
  requestedToken: string | null;
  adminAccessToken: string | undefined;
  isProduction: boolean;
}

export function isAdminAccessAllowed({
  requestedToken,
  adminAccessToken,
  isProduction,
}: AdminAccessContext) {
  if (!adminAccessToken) {
    return !isProduction;
  }

  if (!requestedToken) {
    return false;
  }

  return requestedToken === adminAccessToken;
}
