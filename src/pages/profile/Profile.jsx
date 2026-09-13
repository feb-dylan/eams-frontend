import { useEffect, useState } from "react";

import employeeApi from "../../services/employeeApi";
import authApi from "../../services/authApi";

import ProfileForm from "../../components/profile/ProfileForm";
import ChangePasswordForm from "../../components/common/ChangePasswordForm";

const Profile = () => {
  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await employeeApi.getCurrentEmployee();
      setEmployee(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSave = async (payload) => {
    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const updated = await employeeApi.updateCurrentEmployee(payload);
      setEmployee(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      setSavingPassword(true);
      await authApi.changePassword(currentPassword, newPassword);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border"></div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-muted mb-0">
          Manage your personal information and password.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                Personal Information
              </h5>
            </div>

            <div className="card-body">
              <ProfileForm
                employee={employee}
                onSubmit={handleProfileSave}
                loading={savingProfile}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2 text-warning"></i>
                Change Password
              </h5>
            </div>

            <div className="card-body">
              <ChangePasswordForm
                onSubmit={handlePasswordChange}
                loading={savingPassword}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;