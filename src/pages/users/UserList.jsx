import { useCallback, useEffect, useState } from "react";
import { userApi } from "../../services/featureApi";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE", "TECHNICIAN"];

/** Admin: invite people, enable/disable accounts, change roles. */
const UserList = () => {
  const { userId } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TECHNICIAN");
  const [inviteLink, setInviteLink] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers(await userApi.list());
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load users."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (e) => {
    e.preventDefault();
    setBusy(true);
    setInviteLink("");
    try {
      const result = await userApi.invite(email.trim(), role);
      setInviteLink(result.inviteLink);
      toast.success(`Invitation created for ${result.user.email}.`);
      setEmail("");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to invite the user."));
    } finally {
      setBusy(false);
    }
  };

  const update = async (user, changes, question) => {
    if (question && !(await confirm({ title: "Please confirm", message: question, variant: "warning" }))) return;
    try {
      await userApi.update(user.id, changes);
      toast.success("User updated.");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update the user."));
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Link copied.");
    } catch {
      toast.error("Copy failed - select the link and copy it manually.");
    }
  };

  if (loading) return <PageLoader text="Loading users..." />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">Users & Invites</h2>
        <p className="text-muted mb-0">Create accounts for managers, technicians and staff</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={invite}>
            <div className="col-md-6">
              <label className="form-label" htmlFor="invite-email">Email</label>
              <input id="invite-email" type="email" className="form-control" value={email}
                     onChange={(e) => setEmail(e.target.value)} required disabled={busy} />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="invite-role">Role</label>
              <select id="invite-role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={busy || !email.trim()}>
                <i className="bi bi-envelope-plus me-1"></i> Send invite
              </button>
            </div>
          </form>

          {inviteLink && (
            <div className="alert alert-success mt-3 mb-0">
              <div className="mb-2">Invitation link (valid 7 days). It was emailed if mail is configured - you can also share it:</div>
              <div className="input-group">
                <input className="form-control" value={inviteLink} readOnly aria-label="Invitation link"
                       onFocus={(e) => e.target.select()} />
                <button className="btn btn-outline-success" type="button" onClick={copy}>Copy</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr><th>Email</th><th>Employee</th><th>Role</th><th>Created</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === userId;
                return (
                  <tr key={u.id}>
                    <td>{u.email}{self && <span className="badge bg-info text-dark ms-2">you</span>}</td>
                    <td>{u.employeeName || <span className="text-muted">-</span>}</td>
                    <td style={{ minWidth: 150 }}>
                      <select className="form-select form-select-sm" value={u.role} disabled={self}
                              aria-label={`Role of ${u.email}`}
                              onChange={(e) => update(u, { role: e.target.value },
                                `Change ${u.email} to ${e.target.value}? They will need to log in again.`)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="small text-muted">{formatDate(u.createdAt)}</td>
                    <td>
                      {u.enabled ? <span className="badge bg-success">Active</span>
                        : <span className="badge bg-secondary">Disabled</span>}
                    </td>
                    <td className="text-end">
                      {!self && (
                        <button className={`btn btn-sm ${u.enabled ? "btn-outline-danger" : "btn-outline-success"}`}
                                onClick={() => update(u, { enabled: !u.enabled },
                                  u.enabled ? `Disable ${u.email}? They are logged out immediately.` : null)}>
                          {u.enabled ? "Disable" : "Enable"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
