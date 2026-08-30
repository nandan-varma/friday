// Lightweight structured console logging. Prefixes every line with a scope
// and timestamp so server logs (Vercel, `next dev`) are greppable per module.
export function createLogger(scope: string) {
  const prefix = `[${scope}]`;
  return {
    debug: (...args: unknown[]) => console.debug(new Date().toISOString(), prefix, ...args),
    info: (...args: unknown[]) => console.log(new Date().toISOString(), prefix, ...args),
    warn: (...args: unknown[]) => console.warn(new Date().toISOString(), prefix, ...args),
    error: (...args: unknown[]) => console.error(new Date().toISOString(), prefix, ...args),
  };
}
