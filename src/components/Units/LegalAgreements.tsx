import React, { useState, useEffect } from "react";
import {
  legalAgreementsApi,
  LegalAgreement,
  CreateLegalAgreementRequest,
  UpdateLegalAgreementRequest,
} from "../services/apiService";

interface LegalAgreementsProps {
  unitId?: string;
}

const LegalAgreements: React.FC<LegalAgreementsProps> = ({ unitId }) => {
  const [agreements, setAgreements] = useState<LegalAgreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] =
    useState<LegalAgreement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    unit_id: unitId || "",
    agreement_type: "",
    document_name: "",
    signatories: [""],
    agreement_date: "",
    valid_until: "",
    status: "draft" as "signed" | "executed" | "draft" | "terminated",
  });
  const [file, setFile] = useState<File | null>(null);

  // Fetch agreements
  const fetchAgreements = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (unitId) {
        response = await legalAgreementsApi.getAgreementsByUnitId(unitId);
      } else {
        response = await legalAgreementsApi.getAllAgreements(1, 100);
      }

      if (response.success && response.data) {
        setAgreements(
          Array.isArray(response.data) ? response.data : [response.data]
        );
      } else {
        setAgreements([]);
      }
    } catch (err: any) {
      setError(err.detail || "Failed to fetch legal agreements");
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [unitId]);

  // Handle create agreement
  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error("Please select a file");
      }

      const createData: CreateLegalAgreementRequest = {
        ...formData,
        signatories: formData.signatories.filter((s) => s.trim() !== ""),
      };

      const response = await legalAgreementsApi.createAgreement(
        createData,
        file
      );

      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        fetchAgreements();
      } else {
        setError(response.message || "Failed to create agreement");
      }
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to create agreement");
    } finally {
      setLoading(false);
    }
  };

  // Handle update agreement
  const handleUpdateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreement) return;

    setLoading(true);
    setError(null);

    try {
      const updateData: UpdateLegalAgreementRequest = {
        ...formData,
        signatories: formData.signatories.filter((s) => s.trim() !== ""),
      };

      const response = await legalAgreementsApi.updateAgreement(
        selectedAgreement.id,
        updateData,
        file || undefined
      );

      if (response.success) {
        setShowEditModal(false);
        resetForm();
        fetchAgreements();
      } else {
        setError(response.message || "Failed to update agreement");
      }
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to update agreement");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete agreement
  const handleDeleteAgreement = async (agreementId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await legalAgreementsApi.deleteAgreement(agreementId);

      if (response.success) {
        setDeleteConfirm(null);
        fetchAgreements();
      } else {
        setError(response.message || "Failed to delete agreement");
      }
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to delete agreement");
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (agreement: LegalAgreement) => {
    try {
      const blob = await legalAgreementsApi.downloadAgreement(
        agreement.file_path
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = agreement.document_name || "agreement.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.detail || "Failed to download file");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      unit_id: unitId || "",
      agreement_type: "",
      document_name: "",
      signatories: [""],
      agreement_date: "",
      valid_until: "",
      status: "draft",
    });
    setFile(null);
  };

  // Add signatory field
  const addSignatory = () => {
    setFormData((prev) => ({
      ...prev,
      signatories: [...prev.signatories, ""],
    }));
  };

  // Update signatory
  const updateSignatory = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      signatories: prev.signatories.map((s, i) => (i === index ? value : s)),
    }));
  };

  // Remove signatory
  const removeSignatory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index),
    }));
  };

  // Open edit modal
  const openEditModal = (agreement: LegalAgreement) => {
    setSelectedAgreement(agreement);
    setFormData({
      unit_id: agreement.unit_id,
      agreement_type: agreement.agreement_type,
      document_name: agreement.document_name,
      signatories:
        agreement.signatories.length > 0 ? agreement.signatories : [""],
      agreement_date: agreement.agreement_date.split("T")[0],
      valid_until: agreement.valid_until.split("T")[0],
      status: agreement.status,
    });
    setShowEditModal(true);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_signature":
        return "bg-green-100 text-green-800";
      case "signed":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "executed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && agreements.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Legal Agreements {unitId ? `(Unit: ${unitId})` : ""}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage legal agreements for {unitId ? "this unit" : "all units"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Create Agreement
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {agreements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No legal agreements
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first legal agreement.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create First Agreement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <div
                key={agreement.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {agreement.document_name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          agreement.status
                        )}`}
                      >
                        {agreement.status.charAt(0).toUpperCase() +
                          agreement.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {agreement.agreement_type}
                      </div>
                      <div>
                        <span className="font-medium">Unit ID:</span>{" "}
                        {agreement.unit_id}
                      </div>
                      <div>
                        <span className="font-medium">Agreement Date:</span>{" "}
                        {new Date(
                          agreement.agreement_date
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Valid Until:</span>{" "}
                        {new Date(agreement.valid_until).toLocaleDateString()}
                      </div>
                    </div>

                    {agreement.signatories &&
                      agreement.signatories.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Signatories:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agreement.signatories.map((signatory, index) => (
                              <span
                                key={index}
                                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {signatory}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="text-xs text-gray-500">
                      Uploaded:{" "}
                      {new Date(agreement.uploaded_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(agreement)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                      title="Download"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => openEditModal(agreement)}
                      className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(agreement.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === agreement.id && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 mb-3">
                      Are you sure you want to delete this agreement? This
                      action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteAgreement(agreement.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Agreement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Legal Agreement
              </h3>
            </div>

            <form onSubmit={handleCreateAgreement} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Unit ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement Type *
                  </label>
                  <select
                    required
                    value={formData.agreement_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreement_type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="lease">Lease Agreement</option>
                    <option value="purchase">Purchase Agreement</option>
                    <option value="rental">Rental Agreement</option>
                    <option value="service">Service Agreement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.document_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        document_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter document name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.agreement_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreement_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valid_until: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_signature">pending_signature</option>
                    <option value="signed">signed</option>
                    <option value="executed">executed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement File *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                  </p>
                </div>
              </div>

              {/* Signatories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Signatories
                  </label>
                  <button
                    type="button"
                    onClick={addSignatory}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Signatory
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.signatories.map((signatory, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={signatory}
                        onChange={(e) => updateSignatory(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter signatory name"
                      />
                      {formData.signatories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSignatory(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Agreement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agreement Modal */}
      {showEditModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Legal Agreement
              </h3>
            </div>

            <form onSubmit={handleUpdateAgreement} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement Type *
                  </label>
                  <select
                    required
                    value={formData.agreement_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreement_type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lease">Lease Agreement</option>
                    <option value="purchase">Purchase Agreement</option>
                    <option value="rental">Rental Agreement</option>
                    <option value="service">Service Agreement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.document_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        document_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.agreement_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreement_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valid_until: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_signature">pending_signature</option>
                    <option value="signed">signed</option>
                    <option value="executed">executed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Agreement File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current file
                  </p>
                </div>
              </div>

              {/* Signatories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Signatories
                  </label>
                  <button
                    type="button"
                    onClick={addSignatory}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Signatory
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.signatories.map((signatory, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={signatory}
                        onChange={(e) => updateSignatory(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter signatory name"
                      />
                      {formData.signatories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSignatory(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Agreement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAgreements;
