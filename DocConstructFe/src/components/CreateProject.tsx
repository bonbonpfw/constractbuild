import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  createProject,
  getProfessionals, 
  getMunicipalities, 
  getDocumentTemplates,
  generateDocument,
  uploadGeneratedDocument
} from '../../api';
import { 
  Professional, 
  Municipality, 
  DocumentTemplate,
  ProfessionalType
} from '../../types';

enum ProjectStep {
  BASIC_INFO = 1,
  SELECT_MUNICIPALITY = 2,
  SELECT_PROFESSIONALS = 3,
  GENERATE_DOCUMENTS = 4,
  REVIEW = 5
}

interface ProfessionalsMap {
  [key: number]: Professional[];
}

const CreateProject: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ProjectStep>(ProjectStep.BASIC_INFO);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Data loading states
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalsByType, setProfessionalsByType] = useState<ProfessionalsMap>({});
  const [professionalTypes, setProfessionalTypes] = useState<ProfessionalType[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<DocumentTemplate[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<{ templateId: number, documentId: number, name: string }[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    municipality_id: '',
    professionals: {} as { [key: number]: number } // Map of professional_type_id to professional_id
  });
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load professionals
        const professionalsData = await getProfessionals();
        setProfessionals(professionalsData);
        
        // Group professionals by type
        const groupedProfessionals: ProfessionalsMap = {};
        const types: ProfessionalType[] = [];
        
        professionalsData.forEach(professional => {
          if (!groupedProfessionals[professional.professional_type.type_id]) {
            groupedProfessionals[professional.professional_type.type_id] = [];
            types.push(professional.professional_type);
          }
          groupedProfessionals[professional.professional_type.type_id].push(professional);
        });
        
        setProfessionalsByType(groupedProfessionals);
        setProfessionalTypes(types);
        
        // Load municipalities
        const municipalitiesData = await getMunicipalities();
        setMunicipalities(municipalitiesData);
      } catch (err: any) {
        setError('Failed to load initial data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Load document templates when municipality is selected
  useEffect(() => {
    const loadDocumentTemplates = async () => {
      if (!formData.municipality_id) return;
      
      setIsLoading(true);
      try {
        const templatesData = await getDocumentTemplates({
          municipality_id: parseInt(formData.municipality_id)
        });
        setDocumentTemplates(templatesData);
      } catch (err: any) {
        setError('Failed to load document templates: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentStep === ProjectStep.SELECT_MUNICIPALITY && formData.municipality_id) {
      loadDocumentTemplates();
    }
  }, [formData.municipality_id, currentStep]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfessionalSelect = (professionalTypeId: number, professionalId: string) => {
    setFormData(prev => ({
      ...prev,
      professionals: {
        ...prev.professionals,
        [professionalTypeId]: parseInt(professionalId)
      }
    }));
  };
  
  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplates(prev => {
      // Check if already selected
      const isSelected = prev.some(t => t.template_id === template.template_id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(t => t.template_id !== template.template_id);
      } else {
        // Add to selection
        return [...prev, template];
      }
    });
  };
  
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === ProjectStep.BASIC_INFO) {
      if (!formData.name || !formData.address) {
        setError('Please fill in all required fields.');
        return;
      }
    } else if (currentStep === ProjectStep.SELECT_MUNICIPALITY) {
      if (!formData.municipality_id) {
        setError('Please select a municipality.');
        return;
      }
    } else if (currentStep === ProjectStep.SELECT_PROFESSIONALS) {
      if (Object.keys(formData.professionals).length === 0) {
        setError('Please select at least one professional.');
        return;
      }
    } else if (currentStep === ProjectStep.GENERATE_DOCUMENTS) {
      if (selectedTemplates.length === 0) {
        setError('Please select at least one document template.');
        return;
      }
    }
    
    setError(null);
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevStep = () => {
    setError(null);
    setCurrentStep(prev => prev - 1);
  };
  
  const handleGenerateDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create project first
      const projectData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        municipality_id: parseInt(formData.municipality_id),
        professionals: Object.entries(formData.professionals).map(([typeId, professionalId]) => ({
          professional_id: professionalId,
          professional_type_id: parseInt(typeId)
        }))
      };
      
      const project = await createProject(projectData);
      
      // Generate documents for each selected template
      const generatedDocs = [];
      
      for (const template of selectedTemplates) {
        // Generate document for this template
        const document = await generateDocument({
          project_id: project.project_id,
          template_id: template.template_id
        });
        
        generatedDocs.push({
          templateId: template.template_id,
          documentId: document.document_id,
          name: template.template_name
        });
      }
      
      setGeneratedDocuments(generatedDocs);
      setSuccess('Project created and documents generated successfully!');
      
      // Move to final step
      setCurrentStep(ProjectStep.REVIEW);
    } catch (err: any) {
      setError(err.message || 'Failed to create project and generate documents.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDocumentUpload = async (documentId: number, file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadGeneratedDocument(documentId, formData);
      
      // Update the generatedDocuments list to mark this as uploaded
      setGeneratedDocuments(prev => 
        prev.map(doc => 
          doc.documentId === documentId 
            ? { ...doc, uploaded: true } 
            : doc
        )
      );
      
      setSuccess('Document uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinish = () => {
    router.push('/projects');
  };
  
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
        <p className="text-sm text-gray-600">Enter the basic information about your construction project.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
  
  const renderMunicipalityStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Municipality</h2>
        <p className="text-sm text-gray-600">Select the municipality where your project is located.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Municipality <span className="text-red-500">*</span>
        </label>
        <select
          name="municipality_id"
          value={formData.municipality_id}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Select a municipality</option>
          {municipalities.map(municipality => (
            <option key={municipality.municipality_id} value={municipality.municipality_id}>
              {municipality.name} {municipality.county && `(${municipality.county})`}
            </option>
          ))}
        </select>
      </div>
      
      {formData.municipality_id && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-medium text-gray-900 mb-2">Selected Municipality Details</h3>
          {municipalities.map(municipality => {
            if (municipality.municipality_id.toString() === formData.municipality_id) {
              return (
                <div key={municipality.municipality_id} className="text-sm text-gray-600">
                  {municipality.contact_person && <p><strong>Contact:</strong> {municipality.contact_person}</p>}
                  {municipality.contact_email && <p><strong>Email:</strong> {municipality.contact_email}</p>}
                  {municipality.contact_phone && <p><strong>Phone:</strong> {municipality.contact_phone}</p>}
                  {municipality.website && (
                    <p>
                      <strong>Website:</strong> 
                      <a 
                        href={municipality.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500 ml-1"
                      >
                        {municipality.website}
                      </a>
                    </p>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
  
  const renderProfessionalsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Project Professionals</h2>
        <p className="text-sm text-gray-600">
          Select the professionals who will be working on this project.
        </p>
      </div>
      
      {professionalTypes.map(type => (
        <div key={type.type_id} className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-medium text-gray-900 mb-2">{type.type_name}</h3>
          <select
            value={formData.professionals[type.type_id] || ''}
            onChange={(e) => handleProfessionalSelect(type.type_id, e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select {type.type_name}</option>
            {professionalsByType[type.type_id]?.map(professional => (
              <option key={professional.professional_id} value={professional.professional_id}>
                {professional.name} {professional.license_number && `(${professional.license_number})`}
              </option>
            ))}
          </select>
          
          {formData.professionals[type.type_id] && (
            <div className="mt-2 text-sm text-gray-600">
              {professionalsByType[type.type_id]?.map(professional => {
                if (professional.professional_id === formData.professionals[type.type_id]) {
                  return (
                    <div key={professional.professional_id}>
                      <p><strong>Name:</strong> {professional.name}</p>
                      {professional.license_number && <p><strong>License:</strong> {professional.license_number}</p>}
                      {professional.email && <p><strong>Email:</strong> {professional.email}</p>}
                      {professional.phone && <p><strong>Phone:</strong> {professional.phone}</p>}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Document Templates</h2>
        <p className="text-sm text-gray-600">
          Select the document templates that will be used for this project.
        </p>
      </div>
      
      {documentTemplates.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          No document templates available for the selected municipality.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documentTemplates.map(template => {
            const isSelected = selectedTemplates.some(t => t.template_id === template.template_id);
            
            return (
              <div 
                key={template.template_id} 
                className={`border rounded-md p-4 cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{template.template_name}</h3>
                    <p className="text-sm text-gray-600">
                      For {template.professional_type?.type_name || 'Unknown Professional Type'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => {}} // handled by the div onClick
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Created Successfully</h2>
        <p className="text-sm text-gray-600">
          Your project has been created and documents have been generated.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-2">Project Details</h3>
        <p className="text-sm text-gray-600"><strong>Name:</strong> {formData.name}</p>
        <p className="text-sm text-gray-600"><strong>Address:</strong> {formData.address}</p>
        {formData.description && (
          <p className="text-sm text-gray-600"><strong>Description:</strong> {formData.description}</p>
        )}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-2">Generated Documents</h3>
        {generatedDocuments.length === 0 ? (
          <p className="text-sm text-gray-600">No documents were generated.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {generatedDocuments.map(doc => (
              <li key={doc.documentId} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        // Logic to download or view the document
                        // This would typically link to an API endpoint
                        window.open(`/api/documents/${doc.documentId}/download`, '_blank');
                      }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  
  const renderStepContent = () => {
    switch (currentStep) {
      case ProjectStep.BASIC_INFO:
        return renderBasicInfoStep();
      case ProjectStep.SELECT_MUNICIPALITY:
        return renderMunicipalityStep();
      case ProjectStep.SELECT_PROFESSIONALS:
        return renderProfessionalsStep();
      case ProjectStep.GENERATE_DOCUMENTS:
        return renderDocumentsStep();
      case ProjectStep.REVIEW:
        return renderReviewStep();
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Create Project
      </h1>
      
      <div className="mb-8">
        <nav className="flex justify-center" aria-label="Progress">
          <ol className="flex items-center">
            {[
              ProjectStep.BASIC_INFO,
              ProjectStep.SELECT_MUNICIPALITY,
              ProjectStep.SELECT_PROFESSIONALS,
              ProjectStep.GENERATE_DOCUMENTS,
              ProjectStep.REVIEW
            ].map((step) => (
              <li key={step} className={`relative ${step < ProjectStep.REVIEW ? 'pr-8' : ''}`}>
                {step < ProjectStep.REVIEW && (
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                  </div>
                )}
                <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep > step 
                    ? 'border-indigo-600 bg-indigo-600' 
                    : currentStep === step 
                      ? 'border-indigo-600 bg-white' 
                      : 'border-gray-300 bg-white'
                }`}>
                  {currentStep > step ? (
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`text-sm ${currentStep === step ? 'text-indigo-600' : 'text-gray-500'}`}>{step}</span>
                  )}
                </div>
              </li>
            ))}
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
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-md flex items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </div>
        )}
        
        {renderStepContent()}
        
        <div className="mt-8 flex justify-between">
          {currentStep > ProjectStep.BASIC_INFO && currentStep !== ProjectStep.REVIEW && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Previous
            </button>
          )}
          
          {currentStep < ProjectStep.GENERATE_DOCUMENTS && (
            <button
              type="button"
              onClick={handleNextStep}
              className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next
            </button>
          )}
          
          {currentStep === ProjectStep.GENERATE_DOCUMENTS && (
            <button
              type="button"
              onClick={handleGenerateDocuments}
              disabled={isLoading}
              className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Project & Generate Documents
            </button>
          )}
          
          {currentStep === ProjectStep.REVIEW && (
            <button
              type="button"
              onClick={handleFinish}
              className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject; 