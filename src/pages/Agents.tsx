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

  /* ─────────────────────── Toast ─────────────────────── */
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // 'success' | 'error' | 'warning'
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-white border-l-4 border-[#4CAF50] text-gray-900";
      case "error":
        return "bg-white border-l-4 border-[#F44336] text-gray-900";
      case "warning":
        return "bg-white border-l-4 border-[#FF9800] text-gray-900";
      default:
        return "bg-white border-l-4 border-[#2196F3] text-gray-900";
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

  /* ─────────────────────── API Calls ─────────────────────── */
  const fetchAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8001/api/agents/all");
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const { agents: list } = await res.json();
      setAgents(list || []);
    } catch (e) {
      setError(e.message);
      showToast("Failed to load agents", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDetails = async (agentId) => {
    setDetailsLoading(true);
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/agents/${agentId}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setSelectedAgent(data);
      setIsDetailsOpen(true);
      showToast("Agent details loaded", "success");
    } catch (e) {
      setError(e.message);
      showToast("Failed to load details", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateAgentStatus = async (agentId, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/agents/update-status/${agentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ status: newStatus }).toString(),
        }
      );
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      showToast(`Agent ${newStatus} successfully!`, "success");
      setIsDetailsOpen(false);
      setSelectedAgent(null);
      fetchAgents();
    } catch (e) {
      setError(e.message);
      showToast("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────── Helpers ─────────────────────── */
  const getStatusColor = (s) => {
    switch (s) {
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

  const getStatusIcon = (s) => {
    switch (s) {
      case "verified":
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAgentDocuments = (agent) => {
    if (!agent) return [];

    if (agent.agent_documents) {
      const docs = Array.isArray(agent.agent_documents)
        ? agent.agent_documents
        : typeof agent.agent_documents === "string"
        ? JSON.parse(agent.agent_documents)
        : [];
      if (Array.isArray(docs)) return docs;
    }

    if (Array.isArray(agent.documents)) return agent.documents;
    if (Array.isArray(agent.files)) return agent.files;

    const list = [];
    if (agent.rera_certificate)
      list.push({ file_name: "RERA Certificate", file_path: agent.rera_certificate, type: "rera" });
    if (agent.pan_card)
      list.push({ file_name: "PAN Card", file_path: agent.pan_card, type: "pan" });
    if (agent.aadhar_card)
      list.push({ file_name: "Aadhar Card", file_path: agent.aadhar_card, type: "aadhar" });
    if (agent.resume_cv)
      list.push({ file_name: "Resume/CV", file_path: agent.resume_cv, type: "resume" });
    return list;
  };

  const getDocumentDisplayName = (doc) =>
    doc.file_name ?? doc.name ?? doc.original_name ?? doc.file_path?.split("/").pop() ?? "Document";

  const getDocumentUrl = (doc) => doc.file_path ?? doc.url ?? doc.download_url ?? "#";

  useEffect(() => {
    fetchAgents();
  }, []);

  /* ─────────────────────── UI ─────────────────────── */
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* ───── Toast (Bottom-Right) ───── */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full rounded-lg shadow-lg ${getToastStyles()} animate-slideIn`}
        >
          <div className="p-4 flex items-start gap-3">
            {getToastIcon()}
            <p className="font-medium">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              className="ml-auto text-gray-500 hover:bg-gray-100 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ───── Header ───── */}
      <header className="bg-[#1DB584] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Agents Management</h1>
            <p className="text-white/90 mt-1">Manage and monitor all real estate agents</p>
          </div>
        </div>
      </header>

      {/* ───── Main Content ───── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="bg-white border-l-4 border-[#C62828] p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#C62828]" />
            <p className="text-[#C62828]">{error}</p>
          </div>
        )}

        {/* ───── Agents Table ───── */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#1DB584] px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-white">All Agents ({agents.length})</h2>
          </div>

          {loading && agents.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1DB584] flex items-center justify-center mx-auto mb-4 animate-spin">
                  <div className="w-8 h-8 border-2 border-transparent rounded-full border-t-white"></div>
                </div>
                <p className="text-gray-500">Loading agents…</p>
              </div>
            </div>
          ) : agents.length === 0 ? (
            <p className="p-12 text-center text-gray-500 text-lg">No agents found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-[#F5F5F5] border-b border-gray-200">
                  <tr>
                    {["Name", "Contact", "Specialization", "Commission", "Status", "Action"].map((h) => (
                      <th key={h} className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map((a) => (
                    <tr key={a.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {a.first_name} {a.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{a.rera_id}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        <p className="text-gray-900">{a.email}</p>
                        <p className="text-gray-500">{a.phone}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded text-sm font-medium bg-[#E0F2F1] text-[#00695C]">
                          {a.specialization}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">{a.commission_rate}%</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded w-fit ${getStatusColor(a.status)}`}>
                          {getStatusIcon(a.status)}
                          <span className="text-sm font-medium capitalize">{a.status}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => fetchAgentDetails(a.id)}
                          className="flex items-center gap-2 font-medium text-[#1DB584] hover:underline"
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
        </section>
      </main>

      {/* ───── Agent Details Modal (Centered) ───── */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#1DB584] px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Agent Details</h3>
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedAgent(null);
                }}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#1DB584] flex items-center justify-center mx-auto mb-3 animate-spin">
                    <div className="w-6 h-6 border-2 border-transparent rounded-full border-t-white"></div>
                  </div>
                  <p className="text-gray-500">Loading details…</p>
                </div>
              </div>
            ) : selectedAgent ? (
              <div className="p-6 space-y-8">
                {/* ── Agent Header ── */}
                <div className="bg-[#E0F2F1] p-5 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedAgent.first_name} {selectedAgent.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedAgent.rera_id}</p>
                  <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded ${getStatusColor(selectedAgent.status)}`}>
                    {getStatusIcon(selectedAgent.status)}
                    <span className="text-sm font-medium capitalize">{selectedAgent.status}</span>
                  </div>
                </div>

                {/* ── Two-column Info Grid ── */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {[
                      { label: "Email", value: selectedAgent.email },
                      { label: "Phone", value: selectedAgent.phone },
                      { label: "Specialization", value: selectedAgent.specialization },
                      { label: "Commission Rate", value: `${selectedAgent.commission_rate}%` },
                    ].map((i) => (
                      <div key={i.label}>
                        <p className="text-sm font-semibold text-[#1DB584]">{i.label}</p>
                        <p className="mt-1 text-gray-900">{i.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    {[
                      { label: "PAN Number", value: selectedAgent.pan_number },
                      { label: "Aadhar Number", value: selectedAgent.aadhar_number },
                      { label: "Experience", value: `${selectedAgent.experience_years || 0} years` },
                    ].map((i) => (
                      <div key={i.label}>
                        <p className="text-sm font-semibold text-[#1DB584]">{i.label}</p>
                        <p className="mt-1 text-gray-900">{i.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── About ── */}
                <div>
                  <p className="text-sm font-semibold text-[#1DB584] mb-2">About</p>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 text-gray-900">
                    {selectedAgent.about_text || "No information provided"}
                  </div>
                </div>

                {/* ── Documents ── */}
                {(() => {
                  const docs = getAgentDocuments(selectedAgent);
                  return docs.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-[#1DB584] mb-3">Documents</p>
                      <div className="space-y-2">
                        {docs.map((d, idx) => (
                          <a
                            key={idx}
                            href={getDocumentUrl(d)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded border border-gray-200 bg-[#E0F2F1] text-[#1DB584] hover:bg-[#b2dfdb] transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span className="truncate flex-1">{getDocumentDisplayName(d)}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-[#1DB584] mb-2">Documents</p>
                      <p className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-500">No documents available</p>
                    </div>
                  );
                })()}

                {/* ── Action Buttons (only for pending) ── */}
                {selectedAgent.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateAgentStatus(selectedAgent.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#2E7D32] text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Agent
                    </button>
                    <button
                      onClick={() => updateAgentStatus(selectedAgent.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#C62828] text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Agent
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-[#BDBDBD]" />
                <p className="text-gray-500">Failed to load agent details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───── Tailwind Animation for Toast ───── */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AgentsManagement;