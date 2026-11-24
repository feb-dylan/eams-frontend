import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import assignmentApi from "../../services/assignmentApi";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";
import { useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";
import DetailRow from "../../components/common/DetailRow";
import PageLoader from "../../components/common/PageLoader";

/**
 * One assignment = one "loan" of an asset to one employee:
 *   ACTIVE  ->  RETURN_REQUESTED (employee asks to give it back)  ->  RETURNED (admin received it).
 * RETURNED is the end: the asset is back in stock, and its next loan is a new assignment.
 */
const STEPS = [
  { status: "ACTIVE", label: "Assigned" },
  { status: "RETURN_REQUESTED", label: "Return requested" },
  { status: "RETURNED", label: "Returned (finished)" },
];

const ReturnDetails = () => {
  const { assignmentId } = useParams();
  const { role } = useAuth();
  const toast = useToast();
  const isAdmin = role === "ADMIN";

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [receiving, setReceiving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAssignment(await assignmentApi.getAssignmentById(assignmentId));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the assignment."));
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    load();
  }, [load]);

  // Admin confirms the asset is physically back.
  const receiveReturn = async (e) => {
    e.preventDefault();
    setReceiving(true);
    try {
      setAssignment(await assignmentApi.returnAssignment(assignmentId, note.trim() || null));
      toast.success("Return received. The asset is back in stock.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to receive the return."));
    } finally {
      setReceiving(false);
    }
  };

  const backLink = (
    <Link to="/assignments" className="btn btn-outline-secondary">
      <i className="bi bi-arrow-left me-1"></i> Back to assignments
    </Link>
  );

  if (loading) return <PageLoader text="Loading assignment..." />;
  if (error || !assignment) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error || "Assignment not found."}</div>
        {backLink}
      </div>
    );
  }

  const a = assignment;
  const currentStep = STEPS.findIndex((s) => s.status === a.status);
  const finished = a.status === "RETURNED";

  return (
    <div className="container mt-4" style={{ maxWidth: 860 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2 flex-wrap">
        <div>
          <h2 className="fw-bold mb-1">Assignment details</h2>
          <p className="text-muted mb-0">
            Who had <strong>{a.assetCode}</strong>, from when to when.
          </p>
        </div>
        {backLink}
      </div>

      {/* PROGRESS: Assigned -> Return requested -> Returned */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex flex-wrap gap-2 align-items-center">
          {STEPS.map((s, i) => (
            <div key={s.status} className="d-flex align-items-center gap-2">
              <span className={`badge rounded-pill ${i <= currentStep ? "bg-primary" : "bg-light text-muted border"}`}>
                {i < currentStep || finished ? <i className="bi bi-check-lg me-1"></i> : null}
                {s.label}
              </span>
              {i < STEPS.length - 1 && <i className="bi bi-arrow-right text-muted"></i>}
            </div>
          ))}
        </div>
      </div>

      {finished ? (
        <div className="alert alert-secondary">
          <i className="bi bi-flag me-2"></i>
          <strong>This assignment is finished.</strong> The asset was returned on {formatDate(a.returnedDate)} and
          is back in stock. If it is given to someone again, that will be a <em>new</em> assignment.
          Nothing more to do here. This page is the record.
        </div>
      ) : isAdmin ? (
        <form className="card shadow-sm border-0 border-start border-warning border-4 mb-4" onSubmit={receiveReturn}>
          <div className="card-body">
            <h5 className="mb-1">
              {a.status === "RETURN_REQUESTED"
                ? `${a.employeeName || "The employee"} wants to return this asset`
                : `${a.employeeName || "The employee"} is still using this asset`}
            </h5>
            <p className="small text-muted mb-2">
              {a.status === "RETURN_REQUESTED"
                ? "Click Receive return after you have the asset in your hands."
                : "You can still take it back early (e.g. the employee is leaving the company)."}
            </p>
            <label className="form-label" htmlFor="receive-note">Condition / note (optional)</label>
            <input id="receive-note" className="form-control mb-2" maxLength={500}
                   value={note} onChange={(e) => setNote(e.target.value)}
                   placeholder="e.g. Returned in good condition, charger included" />
            <button type="submit" className="btn btn-warning" disabled={receiving}>
              <i className="bi bi-box-arrow-in-down me-1"></i> {receiving ? "Receiving..." : "Receive return"}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert alert-info">
          {a.status === "RETURN_REQUESTED"
            ? "The employee asked to return this asset. An admin will receive it."
            : "This asset is currently in use by the employee."}
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <DetailRow label="Status"><StatusBadge value={a.status} /></DetailRow>
          <DetailRow label="Asset">
            <Link to={`/assets/${a.assetId}`}><strong>{a.assetCode}</strong></Link> - {a.assetName}
          </DetailRow>
          <DetailRow label="Employee">
            {a.employeeName}{a.employeeCode && <span className="text-muted"> ({a.employeeCode})</span>}
          </DetailRow>
          <DetailRow label="Assigned by">{a.assignedByEmail}</DetailRow>
          <DetailRow label="Assigned on">{formatDate(a.assignedDate)}</DetailRow>
          <DetailRow label="Returned on">{finished ? formatDate(a.returnedDate) : "Not returned yet"}</DetailRow>
          <DetailRow label="Return note">
            {a.returnNote || <span className="text-muted">No note</span>}
          </DetailRow>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetails;
