export function cacheable(url, method, origin, shell) {
  const parsed = new URL(url);
  return (
    method === "GET" &&
    parsed.origin === origin &&
    parsed.search === "" &&
    !parsed.pathname.startsWith("/api/") &&
    shell.includes(parsed.pathname)
  );
}
