/* Patients Feature API - Centralized API calls for patient-related operations */

import apiClient from "../../services/apiClient";

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : undefined);

/**
 * Fetch all patients with optional filtering
 */
export const fetchPatients = async (token, filters = {}) => {
  try {
    const response = await apiClient.get("/patients", {
      headers: authHeaders(token),
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch patients");
  }
};

/**
 * Fetch single patient by ID
 */
export const fetchPatientById = async (token, id) => {
  try {
    const response = await apiClient.get(`/patients/${id}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch patient");
  }
};

/**
 * Create new patient
 */
export const createPatient = async (token, patientData) => {
  try {
    const response = await apiClient.post("/patients", patientData, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to create patient");
  }
};

/**
 * Update patient information
 */
export const updatePatient = async (token, id, patientData) => {
  try {
    const response = await apiClient.put(`/patients/${id}`, patientData, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to update patient");
  }
};

/**
 * Delete patient
 */
export const deletePatient = async (token, id) => {
  try {
    const response = await apiClient.delete(`/patients/${id}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to delete patient");
  }
};

/**
 * Search patients by name, phone, or ID
 */
export const searchPatients = async (token, searchQuery) => {
  try {
    const response = await apiClient.get("/patients/search", {
      headers: authHeaders(token),
      params: { q: searchQuery },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to search patients");
  }
};
