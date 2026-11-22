/**
 * Server-Sent Events over fetch(), so the Authorization header can be sent
 * (the browser's EventSource cannot send headers).
 *
 * Usage:
 *   const stop = connectSse(url, token, { onEvent: (name, data) => ..., onError });
 *   stop(); // closes the connection and stops reconnecting
 *
 * Reconnects automatically with backoff (2s, 4s, 8s ... max 30s).
 */
export function connectSse(url, token, { onEvent, onError } = {}) {
  let controller = null;
  let stopped = false;
  let retryDelay = 2000;
  let retryTimer = null;

  const run = async () => {
    controller = new AbortController();
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        throw Object.assign(new Error(`SSE HTTP ${response.status}`), { status: response.status });
      }
      retryDelay = 2000;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary;
        while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
          const raw = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, "");
          const event = parseSseEvent(raw);
          if (event && onEvent) onEvent(event.name, event.data);
        }
      }
    } catch (err) {
      if (stopped || err?.name === "AbortError") return;
      onError?.(err);
      if (err?.status === 401 || err?.status === 403) return; // do not retry with a bad token
    }
    if (!stopped) {
      retryTimer = setTimeout(run, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  };

  run();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    controller?.abort();
  };
}

/** Parses one SSE block ("event: x\ndata: {...}") -> { name, data } or null for comments. */
export function parseSseEvent(raw) {
  let name = "message";
  const dataLines = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    const idx = line.indexOf(":");
    const field = idx === -1 ? line : line.slice(0, idx);
    const value = idx === -1 ? "" : line.slice(idx + 1).replace(/^ /, "");
    if (field === "event") name = value;
    else if (field === "data") dataLines.push(value);
  }
  if (dataLines.length === 0) return null;
  const text = dataLines.join("\n");
  try {
    return { name, data: JSON.parse(text) };
  } catch {
    return { name, data: text };
  }
}
