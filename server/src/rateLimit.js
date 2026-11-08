/**
 * Small in-memory fixed-window limiter. Fine for a single Render instance;
 * swap for a shared store if the service is ever scaled out.
 */
export function createLimiter({ windowMs, max }) {
  const hits = new Map();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs);
  timer.unref();

  /** Returns true if this hit is allowed. */
  return function allow(key) {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}

/** Express middleware wrapper. */
export function limitRequests(options, keyFn = (req) => req.ip) {
  const allow = createLimiter(options);
  return (req, res, next) => {
    if (allow(keyFn(req))) return next();
    res.status(429).json({ error: "Too many attempts. Give it a minute and try again." });
  };
}
