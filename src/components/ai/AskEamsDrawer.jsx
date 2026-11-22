import { useEffect, useRef, useState } from "react";
import { assistantApi } from "../../services/featureApi";
import Markdown from "./Markdown";
import { getErrorMessage } from "../../utils/apiError";

const SUGGESTIONS = [
  "Which assets should we replace and why?",
  "Warranties ending in the next 30 days",
  "Repair spend by category",
  "How many assets per status?",
];

/** Floating "Ask EAMS" chat (admin + manager). Hidden when AI is not configured. */
const AskEamsDrawer = () => {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    assistantApi.status().then((s) => setEnabled(Boolean(s.assistantEnabled))).catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  if (!enabled) return null;

  const ask = async (text) => {
    const q = (text ?? question).trim();
    if (!q || busy) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const result = await assistantApi.ask(q);
      setMessages((m) => [...m, { role: "ai", text: result.answer, tools: result.toolsUsed }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "error", text: getErrorMessage(err, "The assistant is unavailable.") }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn-primary rounded-pill shadow position-fixed px-3 py-2"
              style={{ right: 24, bottom: 24, zIndex: 1040 }} onClick={() => setOpen(true)}
              aria-label="Open Ask EAMS assistant">
        <i className="bi bi-stars me-1"></i> Ask EAMS
      </button>

      {open && (
        <>
          <div className="offcanvas-backdrop fade show" onClick={() => setOpen(false)}></div>
          <aside className="offcanvas offcanvas-end show d-flex flex-column" style={{ width: 420, maxWidth: "100vw" }}
                 role="dialog" aria-modal="true" aria-labelledby="ask-eams-title">
            <div className="offcanvas-header border-bottom">
              <h5 className="offcanvas-title" id="ask-eams-title"><i className="bi bi-stars text-primary me-2"></i>Ask EAMS</h5>
              <button type="button" className="btn-close" onClick={() => setOpen(false)} aria-label="Close"></button>
            </div>

            <div className="offcanvas-body flex-grow-1" style={{ overflowY: "auto" }}>
              {messages.length === 0 && (
                <>
                  <p className="text-muted small">Ask about your assets, repairs, costs and warranties.</p>
                  <div className="d-flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => ask(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`mb-3 d-flex ${m.role === "user" ? "justify-content-end" : ""}`}>
                  <div className={`rounded-3 p-2 px-3 ${m.role === "user" ? "bg-primary text-white"
                    : m.role === "error" ? "bg-danger-subtle" : "bg-light"}`} style={{ maxWidth: "90%" }}>
                    {m.role === "ai" ? <Markdown text={m.text} /> : <div className="small">{m.text}</div>}
                    {m.tools?.length > 0 && (
                      <div className="small text-muted mt-1">
                        <i className="bi bi-database me-1"></i>looked up: {[...new Set(m.tools)].join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="text-muted small d-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> Looking it up...
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form className="border-top p-3" onSubmit={(e) => { e.preventDefault(); ask(); }}>
              <div className="input-group">
                <label className="visually-hidden" htmlFor="ask-input">Your question</label>
                <input id="ask-input" className="form-control" maxLength={1000} value={question}
                       onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." disabled={busy} autoFocus />
                <button className="btn btn-primary" type="submit" disabled={busy || !question.trim()} aria-label="Send">
                  <i className="bi bi-send"></i>
                </button>
              </div>
              <div className="form-text">Answers come from your EAMS data. Free AI models have a daily limit.</div>
            </form>
          </aside>
        </>
      )}
    </>
  );
};

export default AskEamsDrawer;
