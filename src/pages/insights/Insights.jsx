import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { insightsApi } from "../../services/featureApi";
import assetApi from "../../services/assetApi";
import StatusBadge from "../../components/common/StatusBadge";
import WaitingRequestsPanel from "../../components/insights/WaitingRequestsPanel";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/common/PageLoader";
import { getErrorMessage } from "../../utils/apiError";
import { daysUntil, formatDate, formatMoney } from "../../utils/format";

const Kpi = ({ icon, label, value, hint, color = "primary" }) => (
  <div className="col-6 col-lg-3">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className={`text-${color} mb-1`}><i className={`bi ${icon} fs-4`} aria-hidden="true"></i></div>
        <div className="small text-muted">{label}</div>
        <div className="fs-4 fw-bold">{value}</div>
        {hint && <div className="small text-muted">{hint}</div>}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, data, money }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-header bg-white"><h5 className="mb-0">{title}</h5></div>
    <div className="card-body" style={{ height: 280 }}>
      {data.length === 0 ? <p className="text-muted">No data yet.</p> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map((d) => ({ label: d.label, value: Number(d.value) }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={!money} />
            <Tooltip formatter={(v) => (money ? formatMoney(v) : v)} />
            <Bar dataKey="value" fill="#0d6efd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

/** Management insights: replacement advice, money at risk, idle assets, warranties. */
const Insights = () => {
  const [summary, setSummary] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [idle, setIdle] = useState([]);
  const [warranty, setWarranty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIdleId, setOpenIdleId] = useState(null);
  const { role } = useAuth();

  useEffect(() => {
    Promise.all([
      insightsApi.summary(),
      insightsApi.replacementCandidates(10),
      insightsApi.idleAssets(90),
      assetApi.getWarrantyExpiring(60),
    ])
      .then(([s, c, i, w]) => {
        setSummary(s);
        setCandidates(c);
        setIdle(i);
        setWarranty(w);
      })
      .catch((err) => setError(getErrorMessage(err, "Failed to load insights.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader text="Crunching the numbers..." />;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1">Insights</h2>
        <p className="text-muted mb-0">Where money is being lost, and what to do about it</p>
      </div>

      <div className="row g-3 mb-4">
        <Kpi icon="bi-cash-stack" label="Inventory book value" value={formatMoney(summary.totalBookValue)}
             hint={`bought for ${formatMoney(summary.totalPurchaseValue)}`} />
        <Kpi icon="bi-tools" label="Total repair spend" value={formatMoney(summary.totalRepairCost)} color="warning" />
        <Kpi icon="bi-exclamation-diamond" label="Money at risk / year" value={formatMoney(summary.moneyAtRisk)}
             hint={`${summary.replacementCandidates} asset(s) to replace`} color="danger" />
        <Kpi icon="bi-recycle" label="Purchases avoided" value={formatMoney(summary.purchasesAvoidedValue)}
             hint={`${summary.reassignments} asset(s) reused`} color="success" />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6"><ChartCard title="Assets by category" data={summary.assetsByCategory} /></div>
        <div className="col-lg-6"><ChartCard title="Repair spend by category" data={summary.repairCostByCategory} money /></div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between">
          <h5 className="mb-0">Replace soon</h5>
          <span className="small text-muted">worst health first</span>
        </div>
        {candidates.length === 0 ? (
          <div className="card-body text-muted">No asset needs replacing right now.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr><th>Asset</th><th>Health</th><th>Age</th><th>Repairs</th><th>Why</th></tr>
              </thead>
              <tbody>
                {candidates.map((h) => (
                  <tr key={h.assetId}>
                    <td>
                      <Link to={`/assets/${h.assetId}`}><strong>{h.assetCode}</strong></Link>
                      <div className="small">{h.assetName}</div>
                    </td>
                    <td><span className="fw-bold">{h.score}</span> <StatusBadge value={h.band} /></td>
                    <td>{h.ageYears} yrs</td>
                    <td>{h.repairCount} · {formatMoney(h.totalRepairCost)}</td>
                    <td className="small text-muted">{h.reasons.slice(-2).join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white"><h5 className="mb-0">Warranties ending (60 days)</h5></div>
            <ul className="list-group list-group-flush">
              {warranty.length === 0 && <li className="list-group-item text-muted">None.</li>}
              {warranty.map((a) => (
                <li key={a.id} className="list-group-item d-flex justify-content-between">
                  <Link to={`/assets/${a.id}`}>{a.assetCode} - {a.name}</Link>
                  <span className="small text-muted">
                    {formatDate(a.warrantyExpiryDate)} ({daysUntil(a.warrantyExpiryDate)} days)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white"><h5 className="mb-0">Idle 90+ days (redeploy before buying)</h5></div>
            <ul className="list-group list-group-flush">
              {idle.length === 0 && <li className="list-group-item text-muted">No idle assets.</li>}
              {idle.map((a) => (
                <li key={a.assetId} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <Link to={`/assets/${a.assetId}`}>{a.assetCode} - {a.assetName}</Link>
                    <span className="small text-muted">
                      {a.idleDays} days
                      {a.pendingRequestsInCategory > 0 && (
                        <button
                          type="button"
                          className="badge bg-success border-0 ms-2"
                          aria-expanded={openIdleId === a.assetId}
                          title="Show the requests this asset could fill"
                          onClick={() => setOpenIdleId(openIdleId === a.assetId ? null : a.assetId)}
                        >
                          {a.pendingRequestsInCategory} waiting request(s)
                          <i className={`bi ms-1 ${openIdleId === a.assetId ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                        </button>
                      )}
                    </span>
                  </div>
                  {openIdleId === a.assetId && <WaitingRequestsPanel assetId={a.assetId} role={role} />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
