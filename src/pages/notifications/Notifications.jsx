import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../services/featureApi";
import PageLoader from "../../components/common/PageLoader";
import { getErrorMessage } from "../../utils/apiError";
import { formatDateTime, formatRelative } from "../../utils/format";

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await notificationApi.list(100));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load notifications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (n) => {
    if (!n.read) await notificationApi.markRead(n.id).catch(() => {});
    if (n.link) navigate(n.link);
    else load();
  };

  const markAll = async () => {
    await notificationApi.markAllRead().catch(() => {});
    load();
  };

  if (loading) return <PageLoader text="Loading notifications..." />;

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notifications</h2>
        {items.some((n) => !n.read) && (
          <button className="btn btn-outline-primary btn-sm" onClick={markAll}>Mark all read</button>
        )}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="list-group shadow-sm">
        {items.length === 0 && <div className="list-group-item text-muted text-center py-5">No notifications yet.</div>}
        {items.map((n) => (
          <button key={n.id} type="button" onClick={() => open(n)}
                  className={`list-group-item list-group-item-action ${n.read ? "" : "list-group-item-light fw-semibold"}`}>
            <div className="d-flex justify-content-between">
              <span>{n.title}</span>
              <span className="small text-muted" title={formatDateTime(n.createdAt)}>{formatRelative(n.createdAt)}</span>
            </div>
            {n.message && <div className="small text-muted fw-normal">{n.message}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
