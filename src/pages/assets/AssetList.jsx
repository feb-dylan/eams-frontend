import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import assetApi from "../../services/assetApi";
import categoryApi from "../../services/categoryApi";
import AssetForm from "../../components/assets/AssetForm";
import { useAuth } from "../../context/AuthContext";

const AssetList = () => {
  const { role } = useAuth();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const isAdmin = role === "ADMIN";

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load categories."
      );
    }
  };

  // =========================================================
  // LOAD ASSETS
  // =========================================================

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (search.trim()) {
        data = await assetApi.searchAssets(search.trim());
      } else if (selectedCategory) {
        data = await assetApi.getAssetsByCategory(
          selectedCategory
        );
      } else if (selectedStatus) {
        data = await assetApi.getAssetsByStatus(
          selectedStatus
        );
      } else {
        data = await assetApi.getAssets();
      }

      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load assets."
      );

      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadAssets();
  }, [search, selectedCategory, selectedStatus]);

  // =========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =========================================================

  useEffect(() => {
    setPage(0);
  }, [search, selectedCategory, selectedStatus]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalElements = assets.length;

  const totalPages =
    totalElements === 0
      ? 0
      : Math.ceil(totalElements / size);

  const startIndex = page * size;
  const endIndex = startIndex + size;

  const currentAssets = assets.slice(
    startIndex,
    endIndex
  );

  // =========================================================
  // CREATE ASSET
  // =========================================================

  const handleCreate = () => {
    setEditingAsset(null);
    setShowForm(true);
    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // EDIT ASSET
  // =========================================================

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // SUBMIT CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (assetData) => {
    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      if (editingAsset) {
        await assetApi.updateAsset(
          editingAsset.id,
          assetData
        );

        setSuccess("Asset updated successfully.");
      } else {
        await assetApi.createAsset(assetData);

        setSuccess("Asset created successfully.");
      }

      setShowForm(false);
      setEditingAsset(null);

      await loadAssets();

      // Go back to first page after create/update
      setPage(0);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to save asset."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================================
  // DELETE ASSET
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await assetApi.deleteAsset(id);

      setSuccess("Asset deleted successfully.");

      await loadAssets();

      // If deleting the last item on a page,
      // move back one page if necessary.
      if (
        currentAssets.length === 1 &&
        page > 0
      ) {
        setPage((previousPage) =>
          previousPage - 1
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to delete asset."
      );
    }
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedStatus("");
    setPage(0);
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-success";

      case "ASSIGNED":
        return "bg-primary";

      case "DAMAGED":
        return "bg-danger";

      case "MAINTENANCE":
        return "bg-warning text-dark";

      case "RETIRED":
        return "bg-secondary";

      default:
        return "bg-secondary";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container-fluid py-4">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Assets</h2>

          <p className="text-muted mb-0">
            Manage enterprise assets
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreate}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Asset
          </button>
        )}
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* =====================================================
          ASSET FORM
      ===================================================== */}

      {showForm && isAdmin && (
        <div className="card shadow-sm mb-4">

          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {editingAsset
                ? "Edit Asset"
                : "Create Asset"}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowForm(false);
                setEditingAsset(null);
              }}
              aria-label="Close"
            ></button>
          </div>

          <div className="card-body">

            {categories.length === 0 ? (
              <div className="alert alert-warning">
                You need to create at least one
                category before creating an asset.
              </div>
            ) : (
              <AssetForm
                initialData={editingAsset}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAsset(null);
                }}
                loading={formLoading}
              />
            )}

          </div>
        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3">

            {/* Search */}

            <div className="col-md-4">

              <label className="form-label">
                Search
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by name or asset code"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />

            </div>

            {/* Category */}

            <div className="col-md-3">

              <label className="form-label">
                Category
              </label>

              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(
                    e.target.value
                  );

                  if (e.target.value) {
                    setSelectedStatus("");
                  }

                  setPage(0);
                }}
              >

                <option value="">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}

              </select>

            </div>

            {/* Status */}

            <div className="col-md-3">

              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(
                    e.target.value
                  );

                  if (e.target.value) {
                    setSelectedCategory("");
                  }

                  setPage(0);
                }}
              >

                <option value="">
                  All Statuses
                </option>

                <option value="AVAILABLE">
                  AVAILABLE
                </option>

                <option value="ASSIGNED">
                  ASSIGNED
                </option>

                <option value="DAMAGED">
                  DAMAGED
                </option>

                <option value="MAINTENANCE">
                  MAINTENANCE
                </option>

                <option value="RETIRED">
                  RETIRED
                </option>

              </select>

            </div>

            {/* Clear */}

            <div className="col-md-2 d-flex align-items-end">

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ASSET TABLE
      ===================================================== */}

      <div className="card shadow-sm">

        {/* TABLE HEADER */}

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">
            Assets
          </h5>

          <span className="badge bg-secondary">
            {totalElements} total
          </span>

        </div>

        <div className="card-body p-0">

          {loading ? (

            /* LOADING */

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-2 mb-0">
                Loading assets...
              </p>

            </div>

          ) : currentAssets.length === 0 ? (

            /* EMPTY */

            <div className="text-center py-5 text-muted">

              <i className="bi bi-box-seam fs-1"></i>

              <p className="mt-2 mb-0">
                No assets found.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>ID</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Serial Number</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {currentAssets.map((asset) => (

                    <tr key={asset.id}>

                      <td>
                        {asset.id}
                      </td>

                      <td>
                        <strong>
                          {asset.assetCode}
                        </strong>
                      </td>

                      <td>
                        {asset.name}
                      </td>

                      <td>
                        {asset.category?.name || "-"}
                      </td>

                      <td>
                        {asset.serialNumber || "-"}
                      </td>

                      <td>

                        <span
                          className={`badge ${getStatusBadge(
                            asset.status
                          )}`}
                        >
                          {asset.status}
                        </span>

                      </td>

                      <td>
                        {asset.location || "-"}
                      </td>

                      <td>

                        <div className="d-flex gap-1">

                          {/* VIEW */}

                          <Link
                            to={`/assets/${asset.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>

                          {/* ADMIN ACTIONS */}

                          {isAdmin && (
                            <>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  handleEdit(asset)
                                }
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDelete(
                                    asset.id
                                  )
                                }
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>

                            </>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading && totalPages > 0 && (

          <div className="card-footer">

            <div className="d-flex justify-content-between align-items-center">

              <span className="text-muted">

                Showing{" "}
                <strong>
                  {startIndex + 1}
                </strong>
                {" - "}
                <strong>
                  {Math.min(
                    endIndex,
                    totalElements
                  )}
                </strong>
                {" "}of{" "}
                <strong>
                  {totalElements}
                </strong>

                {" "}assets

                <span className="ms-2">
                  (Page {page + 1} of{" "}
                  {totalPages})
                </span>

              </span>

              <div className="btn-group">

                {/* PREVIOUS */}

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={page === 0}
                  onClick={() =>
                    setPage((previousPage) =>
                      Math.max(
                        0,
                        previousPage - 1
                      )
                    )
                  }
                >

                  <i className="bi bi-chevron-left"></i>

                  {" "}Previous

                </button>

                {/* NEXT */}

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={
                    page >= totalPages - 1
                  }
                  onClick={() =>
                    setPage(
                      (previousPage) =>
                        previousPage + 1
                    )
                  }
                >

                  Next

                  {" "}

                  <i className="bi bi-chevron-right"></i>

                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default AssetList;