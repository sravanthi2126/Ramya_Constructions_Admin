import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  X,
} from "lucide-react";

const AgentsManagement = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // 'success', 'error', 'warning'
  });

  // Show toast function
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Fetch all agents (GET on port 8001)
  const fetchAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8001/api/agents/all");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch agents: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching agents:", err);
      showToast("Failed to load agents", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch agent details (GET on port 8001)
  const fetchAgentDetails = async (agentId) => {
    setDetailsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/agents/${agentId}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch agent details: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      setSelectedAgent(data);
      setIsDetailsOpen(true);
      showToast("Agent details loaded successfully", "success");
    } catch (err) {
      console.error("Error fetching agent details:", err);
      setError(err.message);
      showToast("Failed to load agent details", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update agent status (PUT on port 8000)
  const updateAgentStatus = async (agentId, newStatus) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/agents/update-status/${agentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ status: newStatus }).toString(),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update status: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      await response.json();
      showToast(`Agent ${newStatus} successfully!`, "success");

      // Close the details modal and refresh agents list
      setIsDetailsOpen(false);
      setSelectedAgent(null);
      fetchAgents();
    } catch (err) {
      setError(err.message);
      console.error("Error updating status:", err);
      showToast("Failed to update agent status", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "approved":
        return "bg-[#E8F5E9] text-[#2E7D32]";
      case "pending":
        return "bg-[#FFF3E0] text-[#E65100]";
      case "rejected":
        return "bg-[#FFEBEE] text-[#C62828]";
      default:
        return "bg-[#F5F5F5] text-[#424242]";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-white border-l-[#4CAF50] text-gray-900";
      case "error":
        return "bg-white border-l-[#F44336] text-gray-900";
      case "warning":
        return "bg-white border-l-[#FF9800] text-gray-900";
      default:
        return "bg-white border-l-[#2196F3] text-gray-900";
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#4CAF50]" />;
      case "error":
        return <XCircle className="w-5 h-5 text-[#F44336]" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-[#FF9800]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#2196F3]" />;
    }
  };

  // Helper function to get documents from agent data
  const getAgentDocuments = (agent) => {
    console.log("Agent data for documents:", agent);

    if (!agent) return [];

    if (agent.agent_documents) {
      console.log("Found agent_documents:", agent.agent_documents);

      if (Array.isArray(agent.agent_documents)) {
        return agent.agent_documents;
      } else if (typeof agent.agent_documents === "string") {
        try {
          const parsedDocs = JSON.parse(agent.agent_documents);
          console.log("Parsed agent_documents:", parsedDocs);
          return Array.isArray(parsedDocs) ? parsedDocs : [];
        } catch (e) {
          console.error("Error parsing agent_documents JSON:", e);
          return [];
        }
      }
    }

    if (agent.documents && Array.isArray(agent.documents)) {
      console.log("Found documents:", agent.documents);
      return agent.documents;
    }

    if (agent.files && Array.isArray(agent.files)) {
      console.log("Found files:", agent.files);
      return agent.files;
    }

    const individualDocs = [];
    if (agent.rera_certificate) {
      individualDocs.push({
        file_name: "RERA Certificate",
        file_path: agent.rera_certificate,
        type: "rera_certificate",
      });
    }
    if (agent.pan_card) {
      individualDocs.push({
        file_name: "PAN Card",
        file_path: agent.pan_card,
        type: "pan_card",
      });
    }
    if (agent.aadhar_card) {
      individualDocs.push({
        file_name: "Aadhar Card",
        file_path: agent.aadhar_card,
        type: "aadhar_card",
      });
    }
    if (agent.resume_cv) {
      individualDocs.push({
        file_name: "Resume/CV",
        file_path: agent.resume_cv,
        type: "resume_cv",
      });
    }

    if (individualDocs.length > 0) {
      console.log("Found individual documents:", individualDocs);
      return individualDocs;
    }

    console.log("No documents found in any field");
    return [];
  };

  // Helper function to get document display name
  const getDocumentDisplayName = (doc) => {
    if (doc.file_name) return doc.file_name;
    if (doc.name) return doc.name;
    if (doc.original_name) return doc.original_name;
    if (doc.file_path) {
      return doc.file_path.split("/").pop() || "Document";
    }
    return "Document";
  };

  // Helper function to get document URL
  const getDocumentUrl = (doc) => {
    if (doc.file_path) return doc.file_path;
    if (doc.url) return doc.url;
    if (doc.download_url) return doc.download_url;
    return "#";
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-[100] max-w-sm w-full rounded-lg shadow-lg border-l-4 ${getToastStyles()} transform transition-all duration-300 ease-in-out`}
        >
          <div className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0">{getToastIcon()}</div>
            <div className="flex-1">
              <p className="font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="flex-shrink-0 text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: "#1DB584" }} className="shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Agents Management
              </h1>
              <p className="text-white mt-1 opacity-90">
                Manage and monitor all real estate agents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div
            className="bg-white border-l-4"
            style={{ borderColor: "#C62828" }}
          >
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" style={{ color: "#C62828" }} />
              <p style={{ color: "#C62828" }}>{error}</p>
            </div>
          </div>
        )}

        {/* Agents List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div
            style={{ backgroundColor: "#1DB584" }}
            className="px-4 sm:px-6 py-4"
          >
            <h2 className="text-lg font-semibold text-white">
              All Agents ({agents.length})
            </h2>
          </div>

          {loading && agents.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#1DB584" }}
                >
                  <div
                    className="w-8 h-8 border-2 border-transparent rounded-full animate-spin"
                    style={{ borderTopColor: "white" }}
                  ></div>
                </div>
                <p className="text-gray-500">Loading agents...</p>
              </div>
            </div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No agents found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead
                  style={{ backgroundColor: "#F5F5F5" }}
                  className="border-b border-gray-200"
                >
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Specialization
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Commission
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr
                      key={agent.id}
                      style={{ backgroundColor: "white" }}
                      className="border-b border-gray-100"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {agent.first_name} {agent.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {agent.rera_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{agent.email}</p>
                          <p className="text-gray-500">{agent.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: "#E0F2F1",
                            color: "#00695C",
                          }}
                        >
                          {agent.specialization}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-900 font-medium">
                        {agent.commission_rate}%
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded w-fit ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {getStatusIcon(agent.status)}
                          <span className="text-sm font-medium capitalize">
                            {agent.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => fetchAgentDetails(agent.id)}
                          style={{ color: "#1DB584" }}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Agent Details Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              style={{ backgroundColor: "#1DB584" }}
              className="px-6 py-4 flex justify-between items-center"
            >
              <h3 className="text-xl font-bold text-white">Agent Details</h3>
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedAgent(null);
                }}
                className="text-white text-2xl leading-none hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "#1DB584" }}
                  >
                    <div
                      className="w-6 h-6 border-2 border-transparent rounded-full animate-spin"
                      style={{ borderTopColor: "white" }}
                    ></div>
                  </div>
                  <p className="text-gray-500">Loading agent details...</p>
                </div>
              </div>
            ) : selectedAgent ? (
              <div className="p-6 space-y-6">
                {/* Agent Header */}
                <div
                  style={{ backgroundColor: "#E0F2F1" }}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-bold text-xl text-gray-900">
                    {selectedAgent.first_name} {selectedAgent.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAgent.rera_id}
                  </p>
                  <div
                    className={`mt-2 flex items-center gap-2 px-3 py-1 rounded w-fit ${getStatusColor(
                      selectedAgent.status
                    )}`}
                  >
                    {getStatusIcon(selectedAgent.status)}
                    <span className="text-sm font-medium capitalize">
                      {selectedAgent.status}
                    </span>
                  </div>
                </div>

                {/* Agent Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 font-medium text-sm">Email</p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-medium text-sm">Phone</p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-medium text-sm">
                        Specialization
                      </p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.specialization}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-medium text-sm">
                        Commission Rate
                      </p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.commission_rate}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 font-medium text-sm">
                        PAN Number
                      </p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.pan_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-medium text-sm">
                        Aadhar Number
                      </p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.aadhar_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-medium text-sm">
                        Experience
                      </p>
                      <p className="text-gray-900 mt-1">
                        {selectedAgent.experience_years || 0} years
                      </p>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <p className="text-gray-600 font-medium text-sm mb-2">
                    About
                  </p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                    {selectedAgent.about_text || "No information provided"}
                  </p>
                </div>

                {/* Documents Section */}
                {getAgentDocuments(selectedAgent).length > 0 ? (
                  <div>
                    <p className="text-gray-600 font-medium text-sm mb-3">
                      Documents
                    </p>
                    <div className="space-y-2">
                      {getAgentDocuments(selectedAgent).map((doc, idx) => (
                        <a
                          key={idx}
                          href={getDocumentUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{
                            color: "#1DB584",
                            backgroundColor: "#E0F2F1",
                          }}
                        >
                          <Download className="w-4 h-4" />
                          <span className="truncate flex-1">
                            {getDocumentDisplayName(doc)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium text-sm mb-2">
                      Documents
                    </p>
                    <p className="text-gray-500 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                      No documents available
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedAgent.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        updateAgentStatus(selectedAgent.id, "approved")
                      }
                      style={{ backgroundColor: "#2E7D32", color: "white" }}
                      className="flex-1 font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Agent
                    </button>
                    <button
                      onClick={() =>
                        updateAgentStatus(selectedAgent.id, "rejected")
                      }
                      style={{ backgroundColor: "#C62828", color: "white" }}
                      className="flex-1 font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Agent
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: "#BDBDBD" }}
                />
                <p className="text-gray-500">Failed to load agent details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsManagement;
