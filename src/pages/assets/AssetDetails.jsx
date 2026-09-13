import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import assetApi from "../../services/assetApi";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:8080";

const AssetDetails = () => {
  const { id } = useParams();
  const { role } = useAuth();

  const [asset, setAsset] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const [success, setSuccess] = useState("");

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await assetApi.getAssetById(id);

        setAsset(data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to load asset."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [id]);

  const handleImageUpload = async () => {
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const imageUrl =
        await assetApi.uploadAssetImage(
          id,
          imageFile
        );

      setAsset((previous) => ({
        ...previous,
        imageUrl,
      }));

      setImageFile(null);

      setSuccess(
        "Asset image uploaded successfully."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQr = async () => {
    try {
      setLoadingQr(true);
      setError("");

      const blob =
        await assetApi.getAssetQrCode(id);

      const url = URL.createObjectURL(blob);

      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }

      setQrUrl(url);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to generate QR code."
      );
    } finally {
      setLoadingQr(false);
    }
  };

  const handlePrintQr = () => {
    if (!qrUrl || !asset) {
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=500,height=650"
    );

    if (!printWindow) {
      setError(
        "Please allow pop-ups to print the QR code."
      );
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${asset.assetCode} - QR Label</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              text-align: center;
              padding: 30px 20px;
              margin: 0;
            }
            .label {
              border: 1px solid #ccc;
              border-radius: 8px;
              padding: 20px;
              display: inline-block;
              min-width: 320px;
            }
            .qr {
              width: 260px;
              height: 260px;
              display: block;
              margin: 0 auto 12px auto;
            }
            .code {
              font-size: 22px;
              font-weight: bold;
              letter-spacing: 1px;
              margin-top: 8px;
            }
            .name {
              font-size: 14px;
              color: #333;
              margin-top: 6px;
            }
            .id {
              font-size: 12px;
              color: #666;
              margin-top: 6px;
            }
            @media print {
              body { padding: 0; }
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <img class="qr" src="${qrUrl}" alt="QR Code" />
            <div class="code">${asset.assetCode || ""}</div>
            <div class="name">${asset.name || ""}</div>
            <div class="id">ID: ${asset.id}</div>
          </div>
          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  useEffect(() => {
    return () => {
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
    };
  }, [qrUrl]);

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

  if (loading) {
    return (
      <div className="container mt-4">
        Loading asset...
      </div>
    );
  }

  if (error && !asset) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>

        <Link
          to="/assets"
          className="btn btn-secondary"
        >
          Back to Assets
        </Link>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Asset not found.
        </div>
      </div>
    );
  }

  const imageUrl = asset.imageUrl
    ? asset.imageUrl.startsWith("http")
      ? asset.imageUrl
      : `${API_BASE_URL}${asset.imageUrl}`
    : null;

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{asset.name}</h2>

          <p className="text-muted mb-0">
            Asset Code: {asset.assetCode}
          </p>
        </div>

        <Link
          to="/assets"
          className="btn btn-secondary"
        >
          Back to Assets
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="row g-4">
        {/* Main details */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                Asset Information
              </h5>
            </div>

            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  ID
                </div>

                <div className="col-md-8">
                  {asset.id}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Asset Code
                </div>

                <div className="col-md-8">
                  {asset.assetCode}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Name
                </div>

                <div className="col-md-8">
                  {asset.name}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Category
                </div>

                <div className="col-md-8">
                  {asset.category?.name || "-"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Serial Number
                </div>

                <div className="col-md-8">
                  {asset.serialNumber || "-"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Status
                </div>

                <div className="col-md-8">
                  <span
                    className={`badge ${getStatusBadge(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Location
                </div>

                <div className="col-md-8">
                  {asset.location || "-"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Purchase Date
                </div>

                <div className="col-md-8">
                  {asset.purchaseDate || "-"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 fw-bold">
                  Purchase Price
                </div>

                <div className="col-md-8">
                  {asset.purchasePrice !== null &&
                  asset.purchasePrice !== undefined
                    ? asset.purchasePrice
                    : "-"}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 fw-bold">
                  Description
                </div>

                <div className="col-md-8">
                  {asset.description || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                Asset Image
              </h5>
            </div>

            <div className="card-body text-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={asset.name}
                  className="img-fluid rounded mb-3"
                  style={{
                    maxHeight: "300px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div className="text-muted py-5">
                  No image uploaded
                </div>
              )}

              {isAdmin && (
                <>
                  <input
                    type="file"
                    className="form-control mb-2"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(
                        e.target.files?.[0] || null
                      )
                    }
                    disabled={uploading}
                  />

                  <button
                    className="btn btn-primary w-100"
                    onClick={handleImageUpload}
                    disabled={
                      uploading || !imageFile
                    }
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload Image"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                Asset QR Code
              </h5>
            </div>

            <div className="card-body text-center">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR code for ${asset.name}`}
                  className="img-fluid mb-3"
                  style={{
                    maxWidth: "250px",
                  }}
                />
              ) : (
                <div className="text-muted mb-3">
                  QR code not generated
                </div>
              )}

              <button
                className="btn btn-outline-primary w-100"
                onClick={handleGenerateQr}
                disabled={loadingQr}
              >
                {loadingQr
                  ? "Generating..."
                  : "Generate QR Code"}
              </button>

              {qrUrl && (
                <a
                  href={qrUrl}
                  download={`${asset.assetCode}-qr.png`}
                  className="btn btn-outline-success w-100 mt-2"
                >
                  <i className="bi bi-download me-1"></i>
                  Download QR
                </a>
              )}

              {qrUrl && (
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={handlePrintQr}
                >
                  <i className="bi bi-printer me-1"></i>
                  Print QR
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;