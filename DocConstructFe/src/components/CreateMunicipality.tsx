import React, { useState } from 'react';
import { createMunicipality, createDocumentTemplate } from '../../api';
import { ProfessionalType } from '../../types';

const CreateMunicipality: React.FC<{ professionalTypes: ProfessionalType[] }> = ({ professionalTypes }) => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  
  // Municipality form data
  const [municipalityData, setMunicipalityData] = useState({
    name: '',
    state: '',
    county: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });
  
  // Template form data
  const [templateData, setTemplateData] = useState({
    template_name: '',
    professional_type_id: '',
    required_fields: [] as string[]
  });
  
  // Template file
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  
  // Maintain a list of added templates
  const [addedTemplates, setAddedTemplates] = useState<Array<{
    name: string;
    professional_type: string;
  }>>([]);
  
  const handleMunicipalityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMunicipalityData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplateData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRequiredFieldsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    setTemplateData(prev => {
      const updatedFields = [...prev.required_fields];
      if (checked) {
        updatedFields.push(value);
      } else {
        const index = updatedFields.indexOf(value);
        if (index > -1) {
          updatedFields.splice(index, 1);
        }
      }
      return { ...prev, required_fields: updatedFields };
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTemplateFile(e.target.files[0]);
    }
  };
  
  const handleCreateMunicipality = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate municipality name
      if (!municipalityData.name) {
        throw new Error('Municipality name is required');
      }
      
      // Create municipality
      const newMunicipality = await createMunicipality(municipalityData);
      
      setMunicipalityId(newMunicipality.municipality_id);
      setSuccess('Municipality created successfully! Now add form templates.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create municipality. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!municipalityId) {
      setError('Municipality ID is missing. Please create a municipality first.');
      return;
    }
    
    if (!templateData.template_name || !templateData.professional_type_id || !templateFile) {
      setError('Please fill in all required fields and upload a template file.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create form data to upload the template
      const formData = new FormData();
      formData.append('template_name', templateData.template_name);
      formData.append('professional_type_id', templateData.professional_type_id);
      formData.append('municipality_id', municipalityId.toString());
      formData.append('file', templateFile);
      
      // Additional metadata about required fields can be added
      if (templateData.required_fields.length > 0) {
        formData.append('required_fields', JSON.stringify(templateData.required_fields));
      }
      
      await createDocumentTemplate(formData);
      
      // Find professional type name for display
      const selectedType = professionalTypes.find(
        type => type.type_id.toString() === templateData.professional_type_id
      );
      
      // Add to the list of templates
      setAddedTemplates(prev => [
        ...prev,
        {
          name: templateData.template_name,
          professional_type: selectedType ? selectedType.type_name : 'Unknown'
        }
      ]);
      
      // Reset template form
      setTemplateData({
        template_name: '',
        professional_type_id: '',
        required_fields: []
      });
      setTemplateFile(null);
      
      // Update success message
      setSuccess('Template added successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to add template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinish = () => {
    // Reset the entire form
    setMunicipalityData({
      name: '',
      state: '',
      county: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      website: ''
    });
    setTemplateData({
      template_name: '',
      professional_type_id: '',
      required_fields: []
    });
    setTemplateFile(null);
    setAddedTemplates([]);
    setMunicipalityId(null);
    setSuccess('Municipality and templates have been created successfully!');
    setStep(1);
  };
  
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Municipality Management
      </h1>
      
      <div className="mb-6">
        <nav className="flex justify-center" aria-label="Progress">
          <ol className="flex items-center">
            <li className={`relative pr-8 ${step === 1 ? 'text-indigo-600' : 'text-gray-500'}`}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-0.5 w-full ${step > 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              </div>
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === 1 ? 'border-indigo-600 bg-white' : step > 1 ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'}`}>
                {step > 1 ? (
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={`text-sm ${step === 1 ? 'text-indigo-600' : 'text-gray-500'}`}>1</span>
                )}
              </div>
              <span className="absolute start-0 top-8 whitespace-nowrap text-sm font-medium">Create Municipality</span>
            </li>
            
            <li className={`relative pr-8 ${step === 2 ? 'text-indigo-600' : 'text-gray-500'}`}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-0.5 w-full ${step > 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              </div>
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === 2 ? 'border-indigo-600 bg-white' : step > 2 ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'}`}>
                {step > 2 ? (
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={`text-sm ${step === 2 ? 'text-indigo-600' : 'text-gray-500'}`}>2</span>
                )}
              </div>
              <span className="absolute start-0 top-8 whitespace-nowrap text-sm font-medium">Add Form Templates</span>
            </li>
          </ol>
        </nav>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        {step === 1 && (
          <form onSubmit={handleCreateMunicipality} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Municipality</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Municipality Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={municipalityData.name}
                onChange={handleMunicipalityInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={municipalityData.state}
                  onChange={handleMunicipalityInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  County
                </label>
                <input
                  type="text"
                  name="county"
                  value={municipalityData.county}
                  onChange={handleMunicipalityInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <input
                type="text"
                name="contact_person"
                value={municipalityData.contact_person}
                onChange={handleMunicipalityInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={municipalityData.contact_email}
                  onChange={handleMunicipalityInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={municipalityData.contact_phone}
                  onChange={handleMunicipalityInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={municipalityData.website}
                onChange={handleMunicipalityInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Creating...' : 'Create Municipality'}
              </button>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Form Templates</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload form templates and assign them to professional types. These will be used to generate documents for construction permits.
              </p>
            </div>
            
            {addedTemplates.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Added Templates</h3>
                <ul className="border rounded-md divide-y divide-gray-200">
                  {addedTemplates.map((template, index) => (
                    <li key={index} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{template.name}</span>
                        <p className="text-sm text-gray-500">For {template.professional_type}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Added
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <form onSubmit={handleAddTemplate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="template_name"
                  value={templateData.template_name}
                  onChange={handleTemplateInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Professional Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="professional_type_id"
                  value={templateData.professional_type_id}
                  onChange={handleTemplateInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a professional type</option>
                  {professionalTypes.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Fields
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['name', 'license_number', 'email', 'phone', 'address'].map((field) => (
                    <div key={field} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`field-${field}`}
                          type="checkbox"
                          value={field}
                          checked={templateData.required_fields.includes(field)}
                          onChange={handleRequiredFieldsChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`field-${field}`} className="font-medium text-gray-700">
                          {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Template Form <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="template-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="template-upload"
                          name="template-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
                {templateFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {templateFile.name}
                  </p>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Finish
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? 'Adding...' : 'Add Template'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMunicipality; 