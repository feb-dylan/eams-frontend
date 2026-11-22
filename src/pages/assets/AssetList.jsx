import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import assetApi from "../../services/assetApi";
import categoryApi from "../../services/categoryApi";
import AssetForm from "../../components/assets/AssetForm";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useConfirm, useToast } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { useDebouncedValue } from "../../utils/hooks";
import { getErrorMessage } from "../../utils/apiError";
import { daysUntil, formatMoney } from "../../utils/format";

const PAGE_SIZE = 10;
const STATUSES = ["AVAILABLE", "ASSIGNED", "DAMAGED", "MAINTENANCE", "RETIRED"];

const AssetList = () => {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const toast = useToast();
  const confirm = useConfirm();

  // Filters live in the URL, so Back and shared links keep them.
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const categoryId = params.get("categoryId") || "";
  const page = Number(params.get("page") || 0);
  const [search, setSearch] = useState(params.get("q") || "");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, asset = edit
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const setParam = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    }, { replace: true });
  }, [setParams]);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  // keep q in the URL
  useEffect(() => {
    if ((params.get("q") || "") !== debouncedSearch) setParam("q", debouncedSearch);
  }, [debouncedSearch, params, setParam]);

  // Load with all filters combined; cancel outdated requests so results never arrive out of order.
  const reload = useCallback((signal) => {
    setLoading(true);
    return assetApi.filterAssets({ status, categoryId, q: debouncedSearch }, { signal })
      .then((data) => {
        setAssets(data);
        setError("");
      })
      .catch((err) => {
        if (err?.name !== "CanceledError") setError(getErrorMessage(err, "Failed to load assets."));
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, [status, categoryId, debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
  const visible = useMemo(() => assets.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [assets, page]);

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await assetApi.updateAsset(editing.id, data);
        toast.success("Asset updated.");
      } else {
        await assetApi.createAsset(data);
        toast.success("Asset created.");
      }
      setEditing(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (asset) => {
    if (!(await confirm({
      title: "Delete asset",
      message: `Delete ${asset.assetCode} - ${asset.name}? Assets with history are retired instead, so nothing is lost.`,
      confirmText: "Delete",
      variant: "danger",
    }))) return;
    try {
      const message = await assetApi.deleteAsset(asset.id);
      toast.success(typeof message === "string" ? message : "Asset deleted.");
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete the asset."));
    }
  };

  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const printLabels = async () => {
    try {
      const blob = await assetApi.getLabelsPdf([...selected]);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create the label sheet."));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setParams({}, { replace: true });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Assets</h2>
          <p className="text-muted mb-0">All company assets</p>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && selected.size > 0 && (
            <button className="btn btn-outline-primary" onClick={printLabels}>
              <i className="bi bi-qr-code me-1"></i> Print {selected.size} QR label(s)
            </button>
          )}
          {isAdmin && !editing && (
            <button className="btn btn-primary" onClick={() => setEditing({})}>
              <i className="bi bi-plus-lg me-1"></i> Add Asset
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {editing && isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-header"><h5 className="mb-0">{editing.id ? "Edit asset" : "New asset"}</h5></div>
          <div className="card-body">
            {categories.length === 0 ? (
              <div className="alert alert-warning mb-0">Create a category first.</div>
            ) : (
              <AssetForm key={editing.id ?? "new"} initialData={editing.id ? editing : null}
                         categories={categories} onSubmit={save} onCancel={() => setEditing(null)} loading={saving} />
            )}
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label" htmlFor="asset-search">Search</label>
              <input id="asset-search" className="form-control" value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Name, code, serial number or location" />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="asset-category">Category</label>
              <select id="asset-category" className="form-select" value={categoryId}
                      onChange={(e) => setParam("categoryId", e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" htmlFor="asset-status">Status</label>
              <select id="asset-status" className="form-select" value={status}
                      onChange={(e) => setParam("status", e.target.value)}>
                <option value="">All</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Results</h5>
          <span className="badge bg-secondary">{assets.length}</span>
        </div>

        {loading ? (
          <PageLoader text="Loading assets..." />
        ) : visible.length === 0 ? (
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
            No assets match these filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {isAdmin && <th><span className="visually-hidden">Select</span></th>}
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => {
                  const warrantyDays = daysUntil(a.warrantyExpiryDate);
                  return (
                    <tr key={a.id}>
                      {isAdmin && (
                        <td>
                          <input type="checkbox" className="form-check-input" checked={selected.has(a.id)}
                                 onChange={() => toggle(a.id)} aria-label={`Select ${a.assetCode}`} />
                        </td>
                      )}
                      <td><strong>{a.assetCode}</strong></td>
                      <td>
                        {a.name}
                        {warrantyDays !== null && warrantyDays >= 0 && warrantyDays <= 30 && (
                          <span className="badge bg-warning text-dark ms-2">Warranty ends in {warrantyDays}d</span>
                        )}
                      </td>
                      <td>{a.category?.name || "-"}</td>
                      <td><StatusBadge value={a.status} /></td>
                      <td>{a.location || "-"}</td>
                      <td>{formatMoney(a.purchasePrice)}</td>
                      <td className="text-end text-nowrap">
                        <Link to={`/assets/${a.id}`} className="btn btn-sm btn-outline-primary me-1"
                              aria-label={`View ${a.assetCode}`}><i className="bi bi-eye"></i></Link>
                        {isAdmin && (
                          <>
                            <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setEditing(a)}
                                    aria-label={`Edit ${a.assetCode}`}><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a)}
                                    aria-label={`Delete ${a.assetCode}`}><i className="bi bi-trash"></i></button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && assets.length > PAGE_SIZE && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, assets.length)} of {assets.length}
            </span>
            <div className="btn-group">
              <button className="btn btn-outline-secondary btn-sm" disabled={page === 0}
                      onClick={() => setParam("page", String(page - 1))}>
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              <button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages - 1}
                      onClick={() => setParam("page", String(page + 1))}>
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
