import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Plus, Edit2, Trash2, X } from "lucide-react";
import axios from "axios";

interface ContactInfo {
  id: string;
  contact_type: string;
  contact_value: string;
  label?: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function ContactInfo() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<ContactInfo | null>(null);
  const [formData, setFormData] = useState({
    contact_type: "",
    contact_value: "",
    label: "",
    is_primary: false,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8001/api/contactInfo/all");
      setContacts(response.data.filter((c: ContactInfo) => c.is_active));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showToast("Failed to fetch contacts", "error");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (currentContact) {
      setFormData({
        contact_type: currentContact.contact_type || "",
        contact_value: currentContact.contact_value || "",
        label: currentContact.label || "",
        is_primary: currentContact.is_primary,
        is_active: currentContact.is_active,
      });
    } else {
      setFormData({
        contact_type: "",
        contact_value: "",
        label: "",
        is_primary: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [currentContact]);

  const handleAdd = () => {
    setCurrentContact(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (contact: ContactInfo) => {
    setCurrentContact(contact);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/contactInfo/delete/${id}`);
      fetchContacts();
      showToast("Contact deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting contact:", error);
      showToast("Failed to delete contact", "error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contact_type: value }));
    setErrors((prev) => ({ ...prev, contact_type: "" }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.contact_type) {
      newErrors.contact_type = "Contact type is required";
      showToast("Please select a contact type", "error");
    }
    
    if (!formData.label || formData.label.trim() === "") {
      newErrors.label = "Label is required";
      showToast("Please enter a label for this contact", "error");
    }
    
    if (!formData.contact_value) {
      newErrors.contact_value = "Contact value is required";
      showToast("Please enter the contact value", "error");
    } else {
      if (formData.contact_type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(formData.contact_value)) {
          newErrors.contact_value = "Invalid email format";
          showToast("Please enter the email correctly (e.g., example@gmail.com)", "error");
        }
      } else if (formData.contact_type === "phone") {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.contact_value)) {
          newErrors.contact_value = "Phone number must be exactly 10 digits";
          showToast("Please enter a valid 10-digit phone number", "error");
        }
      } else if (formData.contact_type === "address") {
        if (formData.contact_value.length < 5) {
          newErrors.contact_value = "Address should be at least 5 characters";
          showToast("Please enter a complete address (minimum 5 characters)", "error");
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const submitData = {
        ...formData,
        contact_type: formData.contact_type.toLowerCase(),
        label: formData.label.trim(),
      };
      if (currentContact) {
        await axios.put(`http://127.0.0.1:8000/api/contactInfo/edit/${currentContact.id}`, submitData);
        showToast("Contact updated successfully", "success");
      } else {
        await axios.post("http://127.0.0.1:8000/api/contactInfo/add", {
          contact_type: submitData.contact_type,
          contact_value: submitData.contact_value,
          label: submitData.label,
          is_primary: submitData.is_primary,
        });
        showToast("Contact added successfully", "success");
      }
      fetchContacts();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving contact:", error);
      showToast("Failed to save contact", "error");
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "phone":
        return <Phone className="w-5 h-5 text-teal-500" />;
      case "email":
        return <Mail className="w-5 h-5 text-teal-500" />;
      case "address":
        return <MapPin className="w-5 h-5 text-teal-500" />;
      default:
        return <Phone className="w-5 h-5 text-teal-500" />;
    }
  };

  const getContactTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "phone":
        return "Phone Number";
      case "email":
        return "Email Address";
      case "address":
        return "Address";
      default:
        return "Contact";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Container - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-300 ${
              toast.type === 'success' ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <span className="flex-1 text-sm">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">Contact Information</h1>
            <p className="text-gray-600 mt-1">Manage your contact details</p>
          </div>
          <Button onClick={handleAdd} className="bg-teal-500 hover:bg-teal-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid gap-4">
          {contacts.length === 0 ? (
            <Card className="border-teal-200">
              <CardContent className="py-12 text-center">
                <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No contacts added yet</p>
                <Button onClick={handleAdd} variant="outline" className="mt-4 border-teal-500 text-teal-600 hover:bg-teal-50">
                  Add Your First Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="border-teal-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-teal-50 rounded-lg">
                        {getIcon(contact.contact_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-teal-600 uppercase">
                            {contact.label}
                          </span>
                          {contact.is_primary && (
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium">{contact.contact_value}</p>
                        <p className="text-sm text-gray-500 mt-1">{getContactTypeLabel(contact.contact_type)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(contact)}
                        className="border-teal-300 text-teal-600 hover:bg-teal-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(contact.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-teal-600">
              {currentContact ? "Edit Contact Info" : "Add Contact Info"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="contact_type" className="text-gray-700 font-medium">
                Contact Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.contact_type} onValueChange={handleSelectChange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select contact type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                </SelectContent>
              </Select>
              {errors.contact_type && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  {errors.contact_type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="label" className="text-gray-700 font-medium">
                Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder={
                  formData.contact_type === "phone" ? "e.g., Mobile, Work, Home" :
                  formData.contact_type === "email" ? "e.g., Personal, Work" :
                  formData.contact_type === "address" ? "e.g., Home, Office" :
                  "Enter a label"
                }
                className="border-gray-300"
              />
              {errors.label && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  {errors.label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_value" className="text-gray-700 font-medium">
                {formData.contact_type === "phone" ? "Phone Number" :
                 formData.contact_type === "email" ? "Email Address" :
                 formData.contact_type === "address" ? "Address" :
                 "Contact Value"} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact_value"
                name="contact_value"
                value={formData.contact_value}
                onChange={handleChange}
                placeholder={
                  formData.contact_type === "phone" ? "+1234567890" :
                  formData.contact_type === "email" ? "example@email.com" :
                  formData.contact_type === "address" ? "Enter your address" :
                  "Enter contact value"
                }
                className="border-gray-300"
              />
              {errors.contact_value && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  {errors.contact_value}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) => handleCheckboxChange("is_primary", !!checked)}
                className="border-teal-500 data-[state=checked]:bg-teal-500"
              />
              <Label htmlFor="is_primary" className="text-gray-700 font-medium cursor-pointer">
                Mark as Primary Contact
              </Label>
            </div>

            {currentContact && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleCheckboxChange("is_active", !!checked)}
                  className="border-teal-500 data-[state=checked]:bg-teal-500"
                />
                <Label htmlFor="is_active" className="text-gray-700 font-medium cursor-pointer">
                  Active
                </Label>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              >
                {currentContact ? "Update Contact" : "Add Contact"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}