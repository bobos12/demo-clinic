import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteVisit, fetchVisitById } from "./visits.api";
import '../../styles/features/visits/_visit-details.scss';

const VisitDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadVisit = async () => {
      try {
        const data = await fetchVisitById(token, id);
        setVisit(data);
      } catch (err) {
        setError(err.message || "Failed to fetch visit");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadVisit();
  }, [id, token]);

  const handleDelete = async () => {
    if (!visit?._id) return;
    if (!window.confirm("Are you sure you want to delete this visit?")) return;

    setDeleting(true);
    setError("");
    try {
      await deleteVisit(token, visit._id);
      navigate("/visits");
    } catch (err) {
      setError(err.message || "Failed to delete visit");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : "-";

  const handleExportPdf = () => {
    window.print();
  };

  const buildVisitExportHtml = (visitData) => {
    const escapeHtml = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");

    const patientName = visitData?.patientId?.name || "Visit";
    const doctorName = visitData?.doctorId?.name || "-";
    const visitDate = formatDate(visitData?.visitDate);
    const followUpDate = formatDate(visitData?.followUpDate);
    const recommendations = visitData?.recommendations || "-";

    const firstKey = (obj) => {
      if (!obj || typeof obj !== "object") return "-";
      const keys = Object.keys(obj);
      return keys.length ? keys[0] : "-";
    };

    const formatFollowUpPeriod = (followUp) => {
      if (!followUp) return "-";
      const parts = [
        followUp.years ? `${followUp.years}y` : null,
        followUp.months ? `${followUp.months}m` : null,
        followUp.days ? `${followUp.days}d` : null,
      ].filter(Boolean);
      return parts.length ? parts.join(" ") : "-";
    };

    const formatRx = (rx = {}) => {
      const parts = [];
      if (rx.sphere) parts.push(`Sph ${rx.sphere}`);
      if (rx.cylinder) parts.push(`Cyl ${rx.cylinder}`);
      if (rx.axis) parts.push(`Axis ${rx.axis}`);
      if (rx.ADD) parts.push(`ADD ${rx.ADD}`);
      return parts.length ? parts.join("  ") : "-";
    };

    const va = visitData?.eyeExam?.visualAcuity || {};
    const refraction = visitData?.eyeExam?.refraction || {};
    const newRx = visitData?.eyeExam?.newPrescription || {};
    const iop = visitData?.eyeExam?.iop || {};

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(patientName)} - Visit</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 22px; margin: 0 0 8px 0; }
            .meta { margin: 0 0 16px 0; color: #444; }
            .section { margin-top: 18px; }
            .section h2 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
            .grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px 16px; margin-top: 10px; }
            .label { font-weight: 700; color: #333; }
            .value { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Patient Visit</h1>
          <div class="meta">${escapeHtml(patientName)}</div>

          <div class="section">
            <h2>Visit Information</h2>
            <div class="grid">
              <div class="label">Patient</div><div>${escapeHtml(patientName)}</div>
              <div class="label">Doctor</div><div>${escapeHtml(doctorName)}</div>
              <div class="label">Visit Date</div><div>${escapeHtml(visitDate)}</div>
              <div class="label">Follow-up Date</div><div>${escapeHtml(followUpDate)}</div>
            </div>
          </div>

          <div class="section">
            <h2>Summary</h2>
            <div class="grid">
              <div class="label">Chief Complaint</div><div class="value">${escapeHtml(firstKey(visitData?.complaint))}</div>
              <div class="label">Medical History</div><div class="value">${escapeHtml(firstKey(visitData?.medicalHistory))}</div>
              <div class="label">Surgical History</div><div class="value">${escapeHtml(firstKey(visitData?.surgicalHistory))}</div>
              <div class="label">Follow-up Period</div><div class="value">${escapeHtml(formatFollowUpPeriod(visitData?.followUp))}</div>
            </div>
          </div>

          <div class="section">
            <h2>Eye Exam (Summary)</h2>
            <div class="grid">
              <div class="label">Visual Acuity (OD)</div><div class="value">${escapeHtml(va.OD || "-")}</div>
              <div class="label">Visual Acuity (OS)</div><div class="value">${escapeHtml(va.OS || "-")}</div>
              <div class="label">Refraction (OD)</div><div class="value">${escapeHtml(formatRx(refraction.OD))}</div>
              <div class="label">Refraction (OS)</div><div class="value">${escapeHtml(formatRx(refraction.OS))}</div>
              <div class="label">New Rx (OD)</div><div class="value">${escapeHtml(formatRx(newRx.OD))}</div>
              <div class="label">New Rx (OS)</div><div class="value">${escapeHtml(formatRx(newRx.OS))}</div>
              <div class="label">IOP (OD)</div><div class="value">${escapeHtml(iop.OD ?? "-")}</div>
              <div class="label">IOP (OS)</div><div class="value">${escapeHtml(iop.OS ?? "-")}</div>
            </div>
          </div>

          <div class="section">
            <h2>Recommendations</h2>
            <div class="value">${escapeHtml(recommendations)}</div>
          </div>
        </body>
      </html>
    `;
  };

  const handleExportWord = () => {
    if (!visit) return;
    const html = buildVisitExportHtml(visit);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const patientName = visit.patientId?.name || "visit";
    const safeName = patientName.replaceAll(/[^a-z0-9-_ ]/gi, "").trim().replaceAll(" ", "_") || "visit";
    const fileName = `${safeName}_visit.doc`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Helper to render history items
  const renderHistory = (historyObj) => {
    if (!historyObj || Object.keys(historyObj).length === 0) return "-";

    return (
      <ul className="detail-list">
        {Object.entries(historyObj).map(([key, item]) => {
          const years = item?.years || 0;
          const months = item?.months || 0;
          const days = item?.days || 0;
          const durationParts = [];
          if (years) durationParts.push(`${years}y`);
          if (months) durationParts.push(`${months}m`);
          if (days) durationParts.push(`${days}d`);
          const duration = durationParts.length > 0 ? `(${durationParts.join(" ")})` : "";
          const eye = item?.eye ? ` [${item.eye}]` : "";
          return <li key={key}>{key} {duration}{eye}</li>;
        })}
      </ul>
    );
  };

  // Helper to render eye exam fields
  const renderEyeValue = (eyeValue) => {
    if (!eyeValue) return "-";

    // If object with values/other
    if (typeof eyeValue === "object") {
      const hasValues = eyeValue.values && eyeValue.values.length > 0;
      const hasOther = eyeValue.other && eyeValue.other.trim() !== "";
      if (!hasValues && !hasOther) return "-";
      return (
        <>
          {hasValues && <div className="exam-values-list">{eyeValue.values.join(", ")}</div>}
          {hasOther && <div className="exam-other-text">{hasValues && "• "} {eyeValue.other}</div>}
        </>
      );
    }

    return eyeValue || "-";
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="details-page">
      <div className="details-container">
        <div className="details-card">
          {error && <div className="form-alert alert-error">{error}</div>}

          {visit && (
            <>
              {/* Header */}
              <div className="details-header">
                <h1 className="details-title">👁️ {visit.patientId?.name || "Visit"}</h1>
                <div className="details-actions">
                  <button className="btn btn-warning" onClick={() => navigate(`/visits/edit/${visit._id}`)}>✏️ Edit</button>
                  <button className="btn btn-export export-hide" onClick={handleExportPdf}>Export PDF</button>
                  <button className="btn btn-export export-hide" onClick={handleExportWord}>Export Word</button>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                  <button className="btn btn-cancel" onClick={() => navigate("/visits")}>← Back</button>
                </div>
              </div>

              {/* Visit Info */}
              <div className="details-section">
                <h3 className="section-title">📋 Visit Information</h3>
                <div className="detail-row"><div className="detail-label">Patient</div><div className="detail-value">{visit.patientId?.name || "-"}</div></div>
                <div className="detail-row"><div className="detail-label">Doctor</div><div className="detail-value">{visit.doctorId?.name || "-"}</div></div>
                <div className="detail-row"><div className="detail-label">Visit Date</div><div className="detail-value">{formatDate(visit.visitDate)}</div></div>
                <div className="detail-row"><div className="detail-label">Follow-up Date</div><div className="detail-value">{formatDate(visit.followUpDate)}</div></div>
                {visit.followUp && (visit.followUp.years || visit.followUp.months || visit.followUp.days) && (
                  <div className="detail-row">
                    <div className="detail-label">Follow-up Period</div>
                    <div className="detail-value">
                      {[visit.followUp.years && `${visit.followUp.years}y`, visit.followUp.months && `${visit.followUp.months}m`, visit.followUp.days && `${visit.followUp.days}d`].filter(Boolean).join(" ") || "-"}
                    </div>
                  </div>
                )}
              </div>

              {/* Patient History */}
              <div className="details-section">
                <h3 className="section-title">📝 Patient History</h3>
                <div className="detail-row">
                  <div className="detail-label">Chief Complaint</div>
                  <div className="detail-value">{renderHistory(visit.complaint)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Medical History</div>
                  <div className="detail-value">{renderHistory(visit.medicalHistory)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Surgical History</div>
                  <div className="detail-value">{renderHistory(visit.surgicalHistory)}</div>
                </div>
              </div>

              {/* Eye Examination */}
              <div className="details-section">
                <h3 className="section-title">👁️ Eye Examination</h3>
                {visit.eyeExam ? (
                  <div className="exam-grid">
                    {Object.entries(visit.eyeExam).map(([key, value]) => {
                      if (!value) return null;

                      // Handle prescription-style objects (oldGlasses, refraction, newPrescription)
                      const isPrescriptionCard = (key === "refraction" || key === "oldGlasses" || key === "newPrescription") && value.OD != null && value.OS != null;
                      if (isPrescriptionCard) {
                        return (
                          <div key={key} className="exam-card nested-exam-card">
                            <div className="exam-field-label">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                            <div className="nested-exam-values">
                              {["OD", "OS"].map((eye) => (
                                <div key={eye} className="nested-eye">
                                  <div className="exam-value-label">{eye === "OD" ? "OD (Right)" : "OS (Left)"}</div>
                                  <div className="nested-values">
                                    {value[eye].sphere != null && value[eye].sphere !== "" && <div>Sphere: {value[eye].sphere}</div>}
                                    {value[eye].cylinder != null && value[eye].cylinder !== "" && <div>Cylinder: {value[eye].cylinder}</div>}
                                    {value[eye].axis != null && value[eye].axis !== "" && <div>Axis: {value[eye].axis}</div>}
                                    {value[eye].ADD != null && value[eye].ADD !== "" && <div>ADD: {value[eye].ADD}</div>}
                                    {!value[eye].sphere && !value[eye].cylinder && !value[eye].axis && !value[eye].ADD && <div>-</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // IOP: simple OD/OS values
                      if (key === "iop" && (value.OD != null || value.OS != null)) {
                        return (
                          <div key={key} className="exam-card">
                            <div className="exam-field-label">IOP (mmHg)</div>
                            <div className="exam-values">
                              {value.OD != null && value.OD !== "" && <div><div className="exam-value-label">OD (Right)</div><div className="exam-value">{value.OD}</div></div>}
                              {value.OS != null && value.OS !== "" && <div><div className="exam-value-label">OS (Left)</div><div className="exam-value">{value.OS}</div></div>}
                            </div>
                          </div>
                        );
                      }

                      // Normal eye fields with values/other
                      if (value.OD || value.OS) {
                        return (
                          <div key={key} className="exam-card">
                            <div className="exam-field-label">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                            <div className="exam-values">
                              {value.OD && <div><div className="exam-value-label">OD (Right)</div><div className="exam-value">{renderEyeValue(value.OD)}</div></div>}
                              {value.OS && <div><div className="exam-value-label">OS (Left)</div><div className="exam-value">{renderEyeValue(value.OS)}</div></div>}
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                ) : (
                  <div className="detail-value">No examination data available</div>
                )}
              </div>

              {/* Recommendations */}
              {visit.recommendations && (
                <div className="details-section">
                  <h3 className="section-title">💊 Recommendations</h3>
                  <div className="detail-value">{visit.recommendations}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitDetails;
