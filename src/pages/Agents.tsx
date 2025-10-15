import React, { useState, useEffect } from 'react';
import { Plus, Eye, CheckCircle, XCircle, AlertCircle, Download, X } from 'lucide-react';

const AgentsManagement = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    pan_number: '',
    aadhar_number: '',
    rera_id: '',
    experience_years: '',
    specialization: '',
    about_text: '',
    commission_rate: '',
    rera_certificate: null,
    pan_card: null,
    aadhar_card: null,
    resume_cv: null,
  });

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success', // 'success', 'error', 'warning'
  });

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Initial form data for reset
  const initialFormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    pan_number: '',
    aadhar_number: '',
    rera_id: '',
    experience_years: '',
    specialization: '',
    about_text: '',
    commission_rate: '',
    rera_certificate: null,
    pan_card: null,
    aadhar_card: null,
    resume_cv: null,
  };

  // Fetch all agents (GET on port 8001)
  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8001/api/agents/all');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching agents:', err);
      showToast('Failed to load agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch agent details (GET on port 8001)
  const fetchAgentDetails = async (agentId) => {
    setDetailsLoading(true);
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/agents/${agentId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch agent details: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      setSelectedAgent(data);
      showToast('Agent details loaded successfully', 'success');
    } catch (err) {
      console.error('Error fetching agent details:', err);
      setError(err.message);
      showToast('Failed to load agent details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Create agent (POST on port 8000)
  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();

    // Create a nested agentdetails object as JSON string
    const agentDetails = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      pan_number: formData.pan_number.trim(),
      aadhar_number: formData.aadhar_number.trim(),
      rera_id: formData.rera_id.trim(),
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : 0,
      commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : 2.0,
      specialization: formData.specialization || '',
      about_text: formData.about_text.trim() || '',
    };

    // Append the agentdetails as JSON string
    formDataToSend.append('agentdetails', JSON.stringify(agentDetails));

    // Append files individually using backend field names
    if (formData.rera_certificate) formDataToSend.append('rera_certificate', formData.rera_certificate);
    if (formData.pan_card) formDataToSend.append('pan_card', formData.pan_card);
    if (formData.aadhar_card) formDataToSend.append('aadhar_card', formData.aadhar_card);
    if (formData.resume_cv) formDataToSend.append('resume_cv', formData.resume_cv);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/agents/create', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error('Backend validation errors:', errorData);
        
        // Handle specific error cases with detailed messages
        let errorMessage = 'Failed to create agent. Please check the form data.';
        
        // Try to extract error message from various possible response formats
        let errorText = '';
        
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle array of validation errors (FastAPI format)
          errorText = errorData.detail[0]?.msg || '';
        } else if (errorData.detail && typeof errorData.detail === 'string') {
          // Handle string detail
          errorText = errorData.detail;
        } else if (errorData.message) {
          errorText = errorData.message;
        } else if (errorData.error) {
          errorText = errorData.error;
        }
        
        // Check the error text for specific field errors
        const errorLower = errorText.toLowerCase();
        
        if (errorLower.includes('email') && (errorLower.includes('already') || errorLower.includes('exist'))) {
          errorMessage = 'Email already exists. Please use a different email address.';
        } else if (errorLower.includes('pan') && (errorLower.includes('already') || errorLower.includes('exist'))) {
          errorMessage = 'PAN number already exists. Please use a different PAN number.';
        } else if (errorLower.includes('aadhar') && (errorLower.includes('already') || errorLower.includes('exist'))) {
          errorMessage = 'Aadhar number already exists. Please use a different Aadhar number.';
        } else if (errorLower.includes('rera') && (errorLower.includes('already') || errorLower.includes('exist'))) {
          errorMessage = 'RERA ID already exists. Please use a different RERA ID.';
        } else if (errorLower.includes('phone') && (errorLower.includes('already') || errorLower.includes('exist'))) {
          errorMessage = 'Phone number already exists. Please use a different phone number.';
        } else if (errorText) {
          errorMessage = errorText;
        }
        
        showToast(errorMessage, 'error');
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log('Agent created successfully:', data);

      setFormData(initialFormData);
      setIsFormOpen(false);
      showToast('Agent created successfully!', 'success');
      fetchAgents();
    } catch (err) {
      setError(err.message);
      console.error('Error creating agent:', err);
      // Error toast is already shown in the response handling above
    } finally {
      setLoading(false);
    }
  };

  // Update agent status (PUT on port 8000)
  const updateAgentStatus = async (agentId, newStatus) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/agents/update-status/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ status: newStatus }).toString(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${response.status} ${response.statusText} - ${errorText}`);
      }
      await response.json();
      showToast(`Agent ${newStatus} successfully!`, 'success');
      fetchAgents();
      if (selectedAgent?.id === agentId) {
        fetchAgentDetails(agentId);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
      showToast('Failed to update agent status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0] && files[0].size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5MB');
      showToast('File size must not exceed 5MB', 'error');
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
    if (files[0]) {
      showToast(`${name.replace('_', ' ')} uploaded successfully`, 'success');
    }
  };

  // Handle text input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'pending':
        return 'bg-[#FFF3E0] text-[#E65100]';
      case 'rejected':
        return 'bg-[#FFEBEE] text-[#C62828]';
      default:
        return 'bg-[#F5F5F5] text-[#424242]';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-[#4CAF50] border-l-[#2E7D32]';
      case 'error':
        return 'bg-[#F44336] border-l-[#C62828]';
      case 'warning':
        return 'bg-[#FF9800] border-l-[#E65100]';
      default:
        return 'bg-[#2196F3] border-l-[#1565C0]';
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  // Helper function to get documents from agent data
  const getAgentDocuments = (agent) => {
    console.log('Agent data for documents:', agent); // Debug log
    
    // Try different possible document field names from backend
    if (agent.agent_documents && Array.isArray(agent.agent_documents) && agent.agent_documents.length > 0) {
      console.log('Found agent_documents:', agent.agent_documents);
      return agent.agent_documents;
    }
    if (agent.documents && Array.isArray(agent.documents) && agent.documents.length > 0) {
      console.log('Found documents:', agent.documents);
      return agent.documents;
    }
    if (agent.files && Array.isArray(agent.files) && agent.files.length > 0) {
      console.log('Found files:', agent.files);
      return agent.files;
    }
    
    // Check for individual document fields
    const individualDocs = [];
    if (agent.rera_certificate) {
      individualDocs.push({ 
        file_name: 'RERA Certificate', 
        file_path: agent.rera_certificate,
        type: 'rera_certificate'
      });
    }
    if (agent.pan_card) {
      individualDocs.push({ 
        file_name: 'PAN Card', 
        file_path: agent.pan_card,
        type: 'pan_card'
      });
    }
    if (agent.aadhar_card) {
      individualDocs.push({ 
        file_name: 'Aadhar Card', 
        file_path: agent.aadhar_card,
        type: 'aadhar_card'
      });
    }
    if (agent.resume_cv) {
      individualDocs.push({ 
        file_name: 'Resume/CV', 
        file_path: agent.resume_cv,
        type: 'resume_cv'
      });
    }
    
    if (individualDocs.length > 0) {
      console.log('Found individual documents:', individualDocs);
      return individualDocs;
    }
    
    console.log('No documents found');
    return [];
  };

  // Helper function to get document display name
  const getDocumentDisplayName = (doc) => {
    if (doc.file_name) return doc.file_name;
    if (doc.name) return doc.name;
    if (doc.original_name) return doc.original_name;
    if (doc.file_path) {
      // Extract filename from path
      return doc.file_path.split('/').pop() || 'Document';
    }
    return 'Document';
  };

  // Helper function to get document URL
  const getDocumentUrl = (doc) => {
    if (doc.file_path) return doc.file_path;
    if (doc.url) return doc.url;
    if (doc.download_url) return doc.download_url;
    return '#';
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-[100] max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getToastStyles()} transform transition-all duration-300 ease-in-out`}>
          <div className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0 text-white">
              {getToastIcon()}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: '#1DB584' }} className="shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Agents Management</h1>
              <p className="text-white mt-1 opacity-90">Manage and monitor all real estate agents</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold border border-white"
              style={{ backgroundColor: '#16A085' }}
            >
              <Plus className="w-5 h-5" />
              Add Agent
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="bg-white border-l-4" style={{ borderColor: '#C62828' }}>
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" style={{ color: '#C62828' }} />
              <p style={{ color: '#C62828' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Agents List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div style={{ backgroundColor: '#1DB584' }} className="px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-white">All Agents ({agents.length})</h2>
          </div>

          {loading && agents.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1DB584' }}>
                  <div className="w-8 h-8 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'white' }}></div>
                </div>
                <p className="text-gray-500">Loading agents...</p>
              </div>
            </div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No agents found. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead style={{ backgroundColor: '#F5F5F5' }} className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">Specialization</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">Commission</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.id} style={{ backgroundColor: 'white' }} className="border-b border-gray-100">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {agent.first_name} {agent.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{agent.rera_id}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{agent.email}</p>
                          <p className="text-gray-500">{agent.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#E0F2F1', color: '#00695C' }}>
                          {agent.specialization}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-900 font-medium">{agent.commission_rate}%</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded w-fit ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                          <span className="text-sm font-medium capitalize">{agent.status}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => fetchAgentDetails(agent.id)}
                          style={{ color: '#1DB584' }}
                          className="flex items-center gap-2 font-medium"
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

        {/* Agent Details Panel */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div style={{ backgroundColor: '#1DB584' }} className="px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Agent Details</h2>
          </div>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#1DB584' }}>
                  <div className="w-6 h-6 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'white' }}></div>
                </div>
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          ) : selectedAgent ? (
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div style={{ backgroundColor: '#E0F2F1' }} className="p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedAgent.first_name} {selectedAgent.last_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAgent.rera_id}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">Email</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.email}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">Phone</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.phone}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">Specialization</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.specialization}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">Commission Rate</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.commission_rate}%</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">PAN Number</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.pan_number}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">Aadhar Number</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.aadhar_number}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-600 font-medium">About</p>
                  <p className="text-gray-900 mt-1">{selectedAgent.about_text || 'N/A'}</p>
                </div>

                <div className={`pb-3 flex items-center gap-2 px-3 py-2 rounded ${getStatusColor(selectedAgent.status)}`}>
                  {getStatusIcon(selectedAgent.status)}
                  <span className="capitalize font-medium">{selectedAgent.status}</span>
                </div>

                {/* Documents Section - Updated */}
                {getAgentDocuments(selectedAgent).length > 0 ? (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-gray-600 font-medium mb-2">Documents</p>
                    <div className="space-y-2">
                      {getAgentDocuments(selectedAgent).map((doc, idx) => (
                        <a
                          key={idx}
                          href={getDocumentUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: '#1DB584', backgroundColor: '#E0F2F1' }}
                        >
                          <Download className="w-3 h-3" />
                          <span className="truncate">{getDocumentDisplayName(doc)}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-gray-600 font-medium mb-2">Documents</p>
                    <p className="text-gray-500 text-sm">No documents available</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => updateAgentStatus(selectedAgent.id, 'approved')}
                  style={{ backgroundColor: '#2E7D32', color: 'white' }}
                  className="flex-1 font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateAgentStatus(selectedAgent.id, 'rejected')}
                  style={{ backgroundColor: '#C62828', color: 'white' }}
                  className="flex-1 font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Eye className="w-12 h-12 mx-auto mb-3" style={{ color: '#BDBDBD' }} />
              <p className="text-gray-500">Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Agent Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div style={{ backgroundColor: '#1DB584' }} className="px-4 sm:px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add New Agent</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white text-2xl leading-none hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form onSubmit={handleCreateAgent}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number *</label>
                      <input
                        type="text"
                        name="pan_number"
                        value={formData.pan_number}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="e.g., ABCDE1234F"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhar Number *</label>
                      <input
                        type="text"
                        name="aadhar_number"
                        value={formData.aadhar_number}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="Enter 12-digit Aadhar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">RERA ID *</label>
                      <input
                        type="text"
                        name="rera_id"
                        value={formData.rera_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="Enter RERA ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Rate (%) *</label>
                      <input
                        type="number"
                        name="commission_rate"
                        value={formData.commission_rate}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                        placeholder="e.g., 2.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">About</label>
                    <textarea
                      name="about_text"
                      value={formData.about_text}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB584] focus:border-transparent"
                      placeholder="Enter agent bio or specialization details"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Required Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload RERA Certificate</label>
                        <div className="flex items-center justify-between bg-yellow-100 p-2 rounded-lg border border-yellow-300">
                          <input
                            type="file"
                            name="rera_certificate"
                            onChange={handleFileChange}
                            accept="application/pdf,image/jpeg,image/png"
                            className="hidden"
                            id="rera_certificate"
                          />
                          <label htmlFor="rera_certificate" className="flex-1 cursor-pointer text-gray-700">
                            {formData.rera_certificate ? formData.rera_certificate.name : 'PDF, JPG or PNG (Max 5MB)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => document.getElementById('rera_certificate').click()}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PAN Card</label>
                        <div className="flex items-center justify-between bg-yellow-100 p-2 rounded-lg border border-yellow-300">
                          <input
                            type="file"
                            name="pan_card"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                            id="pan_card"
                          />
                          <label htmlFor="pan_card" className="flex-1 cursor-pointer text-gray-700">
                            {formData.pan_card ? formData.pan_card.name : 'PDF format preferred (Max 5MB)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => document.getElementById('pan_card').click()}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Aadhar Card</label>
                        <div className="flex items-center justify-between bg-yellow-100 p-2 rounded-lg border border-yellow-300">
                          <input
                            type="file"
                            name="aadhar_card"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                            id="aadhar_card"
                          />
                          <label htmlFor="aadhar_card" className="flex-1 cursor-pointer text-gray-700">
                            {formData.aadhar_card ? formData.aadhar_card.name : 'PDF format preferred (Max 5MB)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => document.getElementById('aadhar_card').click()}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Resume/CV</label>
                        <div className="flex items-center justify-between bg-yellow-100 p-2 rounded-lg border border-yellow-300">
                          <input
                            type="file"
                            name="resume_cv"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                            id="resume_cv"
                          />
                          <label htmlFor="resume_cv" className="flex-1 cursor-pointer text-gray-700">
                            {formData.resume_cv ? formData.resume_cv.name : 'PDF format preferred (Max 5MB)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => document.getElementById('resume_cv').click()}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ backgroundColor: '#1DB584', color: 'white' }}
                      className="flex-1 px-6 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Create Agent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsManagement;