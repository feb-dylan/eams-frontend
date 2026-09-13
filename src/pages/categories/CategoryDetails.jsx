import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import categoryApi from "../../services/categoryApi";

const CategoryDetails = () => {
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);

  const [error, setError] = useState("");
  const [assetsError, setAssetsError] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await categoryApi.getCategoryById(id);

        setCategory(data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to load category."
        );
      } finally {
        setLoading(false);
      }
    };

    const loadAssets = async () => {
      try {
        setAssetsLoading(true);
        setAssetsError("");

        const data =
          await categoryApi.getAssetsByCategory(id);

        setAssets(data);
      } catch (error) {
        console.error(error);

        setAssetsError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to load assets."
        );
      } finally {
        setAssetsLoading(false);
      }
    };

    loadCategory();
    loadAssets();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-4">
        Loading category...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>

        <Link
          to="/categories"
          className="btn btn-secondary"
        >
          Back to Categories
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Category not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{category.name}</h2>

          <p className="text-muted mb-0">
            Category Details
          </p>
        </div>

        <Link
          to="/categories"
          className="btn btn-secondary"
        >
          Back
        </Link>
      </div>

      {/* =====================================================
          CATEGORY INFORMATION
      ===================================================== */}

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <div className="row mb-3">
            <div className="col-md-3 fw-bold">
              ID
            </div>

            <div className="col-md-9">
              {category.id}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-3 fw-bold">
              Name
            </div>

            <div className="col-md-9">
              {category.name}
            </div>
          </div>

          <div className="row">
            <div className="col-md-3 fw-bold">
              Description
            </div>

            <div className="col-md-9">
              {category.description || (
                <span className="text-muted">
                  No description
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          ASSETS UNDER CATEGORY
      ===================================================== */}

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Assets in this Category
          </h5>

          {!assetsLoading && (
            <span className="badge bg-primary">
              {assets.length}
            </span>
          )}
        </div>

        <div className="card-body p-0">

          {assetsLoading ? (
            <div className="p-4 text-center">
              Loading assets...
            </div>
          ) : assetsError ? (
            <div className="p-4">
              <div className="alert alert-danger mb-0">
                {assetsError}
              </div>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-4">
              <div className="alert alert-info mb-0">
                No assets are assigned to this category.
              </div>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Asset Code</th>
                    <th>Name</th>
                    <th>Serial Number</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>

                      <td>
                        <strong>
                          {asset.assetCode}
                        </strong>
                      </td>

                      <td>
                        {asset.name}
                      </td>

                      <td>
                        {asset.serialNumber || (
                          <span className="text-muted">
                            N/A
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="badge bg-secondary">
                          {asset.status}
                        </span>
                      </td>

                      <td>
                        {asset.location || (
                          <span className="text-muted">
                            N/A
                          </span>
                        )}
                      </td>

                      <td>
                        <Link
                          to={`/assets/${asset.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </Link>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default CategoryDetails;