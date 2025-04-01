import React, { useState, useEffect } from 'react';
import { 
  getMunicipalities,
  getMunicipalityById,
  createMunicipality,
  updateMunicipality,
  deleteMunicipality,
  getDocumentTemplates,
  createDocumentTemplate,
  deleteDocumentTemplate,
  getProfessionalTypes
} from '../api';
import { Municipality, DocumentTemplate, ProfessionalType } from '../types';

const MunicipalityManagement: React.FC = () => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [professionalTypes, setProfessionalTypes] = useState<ProfessionalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  const [currentMunicipality, setCurrentMunicipality] = useState<Municipality | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<number | null>(null);
  
  const [municipalityForm, setMunicipalityForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [templateForm, setTemplateForm] = useState({
    template_name: '',
    template_description: '',
    municipality_id: 0,
    professional_type_id: 0
  });
  
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [municipalitiesData, templatesData, typesData] = await Promise.all([
        getMunicipalities(),
        getDocumentTemplates(),
        getProfessionalTypes()
      ]);
      setMunicipalities(municipalitiesData);
      setDocumentTemplates(templatesData);
      setProfessionalTypes(typesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMunicipalityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMunicipalityForm({
      ...municipalityForm,
      [name]: value
    });
  };

  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplateForm({
      ...templateForm,
      [name]: value
    });
  };

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTemplateFile(e.target.files[0]);
    }
  };

  const resetMunicipalityForm = () => {
    setMunicipalityForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      template_name: '',
      template_description: '',
      municipality_id: selectedMunicipalityId || 0,
      professional_type_id: 0
    });
    setTemplateFile(null);
  };

  const handleAddMunicipality = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createMunicipality(municipalityForm);
      setMunicipalities([...municipalities, response]);
      setShowAddModal(false);
      resetMunicipalityForm();
    } catch (err) {
      setError('Failed to add municipality. Please try again.');
      console.error('Error adding municipality:', err);
    }
  };

  const handleEditMunicipality = (municipality: Municipality) => {
    setCurrentMunicipality(municipality);
    setMunicipalityForm({
      name: municipality.name,
      contact_person: municipality.contact_person,
      email: municipality.email,
      phone: municipality.phone,
      address: municipality.address
    });
    setShowEditModal(true);
  };

  const handleUpdateMunicipality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMunicipality) return;
    
    try {
      const response = await updateMunicipality(currentMunicipality.id, municipalityForm);
      setMunicipalities(municipalities.map(m => 
        m.id === currentMunicipality.id ? response : m
      ));
      setShowEditModal(false);
      resetMunicipalityForm();
    } catch (err) {
      setError('Failed to update municipality. Please try again.');
      console.error('Error updating municipality:', err);
    }
  };

  const handleDeleteMunicipality = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this municipality? This will also delete all associated templates.')) {
      try {
        await deleteMunicipality(id);
        setMunicipalities(municipalities.filter(m => m.id !== id));
        setDocumentTemplates(documentTemplates.filter(t => t.municipality_id !== id));
      } catch (err) {
        setError('Failed to delete municipality. Please try again.');
        console.error('Error deleting municipality:', err);
      }
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFile) {
      setError('Please select a template file.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('template_name', templateForm.template_name);
      formData.append('template_description', templateForm.template_description);
      formData.append('municipality_id', String(templateForm.municipality_id));
      formData.append('professional_type_id', String(templateForm.professional_type_id));
      formData.append('file', templateFile);
      
      const response = await createDocumentTemplate(formData);
      setDocumentTemplates([...documentTemplates, response]);
      setShowTemplateModal(false);
      resetTemplateForm();
    } catch (err) {
      setError('Failed to add template. Please try again.');
      console.error('Error adding template:', err);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteDocumentTemplate(id);
        setDocumentTemplates(documentTemplates.filter(t => t.id !== id));
      } catch (err) {
        setError('Failed to delete template. Please try again.');
        console.error('Error deleting template:', err);
      }
    }
  };

  const openTemplateModal = (municipalityId: number) => {
    setSelectedMunicipalityId(municipalityId);
    setTemplateForm({
      ...templateForm,
      municipality_id: municipalityId
    });
    setShowTemplateModal(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Municipality Management</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            resetMunicipalityForm();
            setShowAddModal(true);
          }}
        >
          Add Municipality
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {municipalities.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">No municipalities found. Add your first municipality to get started.</p>
            </div>
          ) : (
            municipalities.map(municipality => (
              <div key={municipality.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{municipality.name}</h2>
                    <p className="text-sm text-gray-500">
                      Contact: {municipality.contact_person} | {municipality.email} | {municipality.phone}
                    </p>
                    <p className="text-sm text-gray-500">Address: {municipality.address}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => openTemplateModal(municipality.id)}
                    >
                      Add Template
                    </button>
                    <button 
                      className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => handleEditMunicipality(municipality)}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => handleDeleteMunicipality(municipality.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6 mb-2">Document Templates</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Template Name</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Professional Type</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentTemplates.filter(t => t.municipality_id === municipality.id).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 px-4 text-center">No templates found for this municipality</td>
                        </tr>
                      ) : (
                        documentTemplates
                          .filter(template => template.municipality_id === municipality.id)
                          .map(template => (
                            <tr key={template.id}>
                              <td className="py-2 px-4 border-b">{template.template_name}</td>
                              <td className="py-2 px-4 border-b">{template.template_description}</td>
                              <td className="py-2 px-4 border-b">
                                {professionalTypes.find(pt => pt.id === template.professional_type_id)?.name || 'Unknown'}
                              </td>
                              <td className="py-2 px-4 border-b">
                                <button 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Municipality Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Add Municipality</h2>
            <form onSubmit={handleAddMunicipality}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Municipality Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={municipalityForm.name} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    name="contact_person" 
                    value={municipalityForm.contact_person} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={municipalityForm.email} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={municipalityForm.phone} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea 
                    name="address" 
                    value={municipalityForm.address} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowAddModal(false);
                    resetMunicipalityForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Municipality Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Edit Municipality</h2>
            <form onSubmit={handleUpdateMunicipality}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Municipality Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={municipalityForm.name} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    name="contact_person" 
                    value={municipalityForm.contact_person} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={municipalityForm.email} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={municipalityForm.phone} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea 
                    name="address" 
                    value={municipalityForm.address} 
                    onChange={handleMunicipalityInputChange} 
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowEditModal(false);
                    resetMunicipalityForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Add Document Template</h2>
            <form onSubmit={handleAddTemplate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input 
                    type="text" 
                    name="template_name" 
                    value={templateForm.template_name} 
                    onChange={handleTemplateInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="template_description" 
                    value={templateForm.template_description} 
                    onChange={handleTemplateInputChange} 
                    className="w-full p-2 border rounded"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Type</label>
                  <select 
                    name="professional_type_id" 
                    value={templateForm.professional_type_id} 
                    onChange={handleTemplateInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Professional Type</option>
                    {professionalTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Template File</label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.odt" 
                    onChange={handleTemplateFileChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, ODT</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowTemplateModal(false);
                    resetTemplateForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalityManagement; 