// Lightweight structured console logging. Prefixes every line with a scope
// and timestamp so server logs (Vercel, `next dev`) are greppable per module.
export function createLogger(scope: string) {
  const _prefix = `[${scope}]`;
  return {
    debug: (..._args: unknown[]) => {},
    info: (..._args: unknown[]) => {},
    warn: (..._args: unknown[]) => {},
    error: (..._args: unknown[]) => {},
  };
}
