interface PreviewConfiguration {
  production: boolean;
  firebase: { projectId: string };
  authEmulatorPort?: number;
}

/** Emulator access is only enabled for an explicit demo environment, never for production. */
export function authPreviewPort(config: PreviewConfiguration): number | null {
  const port = config.authEmulatorPort;
  return !config.production &&
    config.firebase.projectId.startsWith('demo-') &&
    typeof port === 'number' &&
    Number.isInteger(port) &&
    port > 0 &&
    port <= 65535
    ? port
    : null;
}
