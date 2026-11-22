import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../services/featureApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../common/Feedback";
import { connectSse } from "../../utils/sse";
import { formatRelative } from "../../utils/format";

/**
 * Bell with unread count. Updates live over Server-Sent Events;
 * if the stream is unavailable it falls back to polling every 60s.
 */
const NotificationBell = () => {
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const refreshCount = useCallback(() => {
    notificationApi.unreadCount().then(setUnread).catch(() => {});
  }, []);

  // live stream + fallback polling
  useEffect(() => {
    if (!token) return undefined;
    refreshCount();
    const stop = connectSse(notificationApi.streamUrl, token, {
      onEvent: (name, data) => {
        if (name === "connected" && typeof data?.unreadCount === "number") {
          setUnread(data.unreadCount);
        }
        if (name === "notification" && data) {
          setUnread((n) => n + 1);
          setItems((list) => [data, ...list].slice(0, 20));
          toastRef.current.info(data.title);
        }
      },
    });
    const poll = setInterval(refreshCount, 60000);
    return () => {
      stop();
      clearInterval(poll);
    };
  }, [token, refreshCount]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        setItems(await notificationApi.list(10));
      } catch {
        /* keep previous list */
      } finally {
        setLoading(false);
      }
    }
  };

  const openItem = async (n) => {
    setOpen(false);
    if (!n.read) {
      setUnread((c) => Math.max(0, c - 1));
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      notificationApi.markRead(n.id).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    await notificationApi.markAllRead().catch(() => {});
    setUnread(0);
    setItems((list) => list.map((x) => ({ ...x, read: true })));
  };

  return (
    <div className="position-relative me-2">
      <button type="button" className="btn btn-sm btn-light border position-relative"
              onClick={toggle} aria-label={`Notifications, ${unread} unread`} aria-expanded={open}>
        <i className="bi bi-bell"></i>
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1000 }}
               onClick={() => setOpen(false)}></div>
          <div className="position-absolute bg-white border rounded-3 shadow"
               style={{ top: "calc(100% + 6px)", right: 0, width: 340, maxWidth: "90vw", zIndex: 1001 }}>
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
              <strong>Notifications</strong>
              {unread > 0 && (
                <button className="btn btn-link btn-sm p-0" onClick={markAll}>Mark all read</button>
              )}
            </div>

            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {loading && <div className="p-3 text-muted small">Loading...</div>}
              {!loading && items.length === 0 && (
                <div className="p-4 text-center text-muted small">
                  <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>
                  You're all caught up
                </div>
              )}
              {!loading && items.map((n) => (
                <button key={n.id} type="button" onClick={() => openItem(n)}
                        className={`dropdown-item text-wrap px-3 py-2 border-bottom ${n.read ? "" : "bg-light"}`}>
                  <div className="d-flex justify-content-between">
                    <span className={n.read ? "" : "fw-semibold"}>{n.title}</span>
                    {!n.read && <span className="badge bg-primary ms-2 align-self-start">new</span>}
                  </div>
                  {n.message && <div className="small text-muted">{n.message}</div>}
                  <div className="small text-muted mt-1">{formatRelative(n.createdAt)}</div>
                </button>
              ))}
            </div>

            <div className="text-center py-2">
              <button className="btn btn-link btn-sm" onClick={() => { setOpen(false); navigate("/notifications"); }}>
                See all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
