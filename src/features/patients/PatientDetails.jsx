import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deletePatient, fetchPatientById } from "./patients.api";
import '../../styles/features/patients/patient-details.scss';

const PatientDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await fetchPatientById(token, id);
        setPatient(data);
      } catch (err) {
        setError(err.message || "Failed to fetch patient");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadPatient();
  }, [id, token]);

  const handleDelete = async () => {
    if (!patient?._id) return;
    if (!window.confirm("Are you sure you want to delete this patient? This will also delete their visits.")) return;

    setDeleting(true);
    setError("");
    try {
      await deletePatient(token, patient._id);
      navigate("/patients");
    } catch (err) {
      setError(err.message || "Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="details-container">
        <div className="details-card">
          {error && <div className="form-alert alert-error">{error}</div>}

          {patient && (
            <>
              <div className="details-header">
                <h1 className="details-title">👤 {patient.name}</h1>
                <div className="details-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/visits?patientId=${patient._id}`)}
                  >
                    📋 View Visits
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => navigate(`/patients/edit/${patient._id}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "ðŸ—‘ï¸ Delete"}
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => navigate("/patients")}
                  >
                    ← Back
                  </button>
                </div>
              </div>

              <div className="details-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="detail-row">
                  <div className="detail-label">Code</div>
                  <div className="detail-value">{patient.code}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{patient.phone}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Age</div>
                  <div className="detail-value">{patient.age}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Gender</div>
                  <div className="detail-value">{patient.gender}</div>
                </div>
              </div>

              {patient.address && (
                <div className="details-section">
                  <h3 className="section-title">Address</h3>
                  <div className="detail-value">{patient.address}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
