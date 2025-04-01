import React, { useState, useEffect } from 'react';
import { 
  getProfessionals, 
  getProfessionalTypes, 
  createProfessional, 
  updateProfessional, 
  deleteProfessional, 
  extractProfessionalData 
} from '../api';
import { Professional, ProfessionalType, ProfessionalStatus } from '../types';

const ProfessionalManagement: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalTypes, setProfessionalTypes] = useState<ProfessionalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    professional_type_id: 0,
    status: ProfessionalStatus.PENDING,
    id_number: '',
    address: ''
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [professionalsData, typesData] = await Promise.all([
        getProfessionals(),
        getProfessionalTypes()
      ]);
      setProfessionals(professionalsData);
      setProfessionalTypes(typesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading professionals data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLicenseFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      license_number: '',
      professional_type_id: 0,
      status: ProfessionalStatus.PENDING,
      id_number: '',
      address: ''
    });
    setLicenseFile(null);
    setExtractionSuccess(false);
  };

  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createProfessional(formData);
      setProfessionals([...professionals, response]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to add professional. Please try again.');
      console.error('Error adding professional:', err);
    }
  };

  const handleEditProfessional = (professional: Professional) => {
    setCurrentProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      license_number: professional.license_number,
      professional_type_id: professional.professional_type_id,
      status: professional.status,
      id_number: professional.id_number || '',
      address: professional.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfessional) return;
    
    try {
      const response = await updateProfessional(currentProfessional.id, formData);
      setProfessionals(professionals.map(p => 
        p.id === currentProfessional.id ? response : p
      ));
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to update professional. Please try again.');
      console.error('Error updating professional:', err);
    }
  };

  const handleDeleteProfessional = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this professional?')) {
      try {
        await deleteProfessional(id);
        setProfessionals(professionals.filter(p => p.id !== id));
      } catch (err) {
        setError('Failed to delete professional. Please try again.');
        console.error('Error deleting professional:', err);
      }
    }
  };

  const handleExtractData = async () => {
    if (!currentProfessional || !licenseFile) return;
    
    setIsExtracting(true);
    setError(null);
    try {
      const extractedData = await extractProfessionalData(currentProfessional.id, licenseFile);
      setFormData({
        ...formData,
        ...extractedData
      });
      setExtractionSuccess(true);
    } catch (err) {
      setError('Failed to extract data from license. Please try again or enter data manually.');
      console.error('Error extracting data:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Professional Management</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          Add Professional
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">License Number</th>
                <th className="py-2 px-4 border-b">Professional Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professionals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center">No professionals found</td>
                </tr>
              ) : (
                professionals.map(professional => (
                  <tr key={professional.id}>
                    <td className="py-2 px-4 border-b">{professional.name}</td>
                    <td className="py-2 px-4 border-b">{professional.email}</td>
                    <td className="py-2 px-4 border-b">{professional.phone}</td>
                    <td className="py-2 px-4 border-b">{professional.license_number}</td>
                    <td className="py-2 px-4 border-b">
                      {professionalTypes.find(pt => pt.id === professional.professional_type_id)?.name || 'Unknown'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded text-sm ${
                        professional.status === ProfessionalStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                        professional.status === ProfessionalStatus.INACTIVE ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {professional.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button 
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => handleEditProfessional(professional)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteProfessional(professional.id)}
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
      )}

      {/* Add Professional Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Add Professional</h2>
            <form onSubmit={handleAddProfessional}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Type</label>
                  <select 
                    name="professional_type_id" 
                    value={formData.professional_type_id} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Type</option>
                    {professionalTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">License Number</label>
                  <input 
                    type="text" 
                    name="license_number" 
                    value={formData.license_number} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Number</label>
                  <input 
                    type="text" 
                    name="id_number" 
                    value={formData.id_number} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
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

      {/* Edit Professional Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Edit Professional</h2>
            <form onSubmit={handleUpdateProfessional}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Type</label>
                  <select 
                    name="professional_type_id" 
                    value={formData.professional_type_id} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Type</option>
                    {professionalTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">License Number</label>
                  <input 
                    type="text" 
                    name="license_number" 
                    value={formData.license_number} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value={ProfessionalStatus.ACTIVE}>Active</option>
                    <option value={ProfessionalStatus.INACTIVE}>Inactive</option>
                    <option value={ProfessionalStatus.PENDING}>Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Number</label>
                  <input 
                    type="text" 
                    name="id_number" 
                    value={formData.id_number} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Upload License Document</label>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={handleFileChange} 
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {licenseFile && (
                <div className="mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 ${isExtracting ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-700'} text-white rounded`}
                    onClick={handleExtractData}
                    disabled={isExtracting}
                  >
                    {isExtracting ? 'Extracting...' : 'Extract Data from License'}
                  </button>
                  {extractionSuccess && (
                    <span className="ml-2 text-green-600">
                      Data extracted successfully!
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
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
    </div>
  );
};

export default ProfessionalManagement; 