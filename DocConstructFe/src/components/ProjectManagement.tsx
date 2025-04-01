import React, { useState, useEffect } from 'react';
import { 
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProfessionals,
  getProfessionalTypes,
  getMunicipalities,
  getDocumentTemplates,
  uploadDocument,
  generateDocument
} from '../api';
import { 
  Project, 
  ProjectStatus, 
  Professional, 
  Municipality, 
  DocumentTemplate,
  ProfessionalType,
  GeneratedDocument
} from '../types';

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalTypes, setProfessionalTypes] = useState<ProfessionalType[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: ProjectStatus.Draft,
    start_date: '',
    end_date: '',
    address: '',
    municipality_id: 0,
    assigned_professionals: [] as number[]
  });
  
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        projectsData, 
        professionalsData, 
        typesData, 
        municipalitiesData, 
        templatesData
      ] = await Promise.all([
        getProjects(),
        getProfessionals(),
        getProfessionalTypes(),
        getMunicipalities(),
        getDocumentTemplates()
      ]);
      
      setProjects(projectsData);
      setProfessionals(professionalsData);
      setProfessionalTypes(typesData);
      setMunicipalities(municipalitiesData);
      setDocumentTemplates(templatesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      status: ProjectStatus.Draft,
      start_date: '',
      end_date: '',
      address: '',
      municipality_id: 0,
      assigned_professionals: []
    });
  };

  const handleProjectInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'municipality_id') {
      setProjectForm({
        ...projectForm,
        [name]: parseInt(value, 10) || 0
      });
    } else {
      setProjectForm({
        ...projectForm,
        [name]: value
      });
    }
  };

  const handleProfessionalsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
    setProjectForm({
      ...projectForm,
      assigned_professionals: selectedOptions
    });
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createProject(projectForm);
      setProjects([...projects, response]);
      setShowAddModal(false);
      resetProjectForm();
    } catch (err) {
      setError('Failed to add project. Please try again.');
      console.error('Error adding project:', err);
    }
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      status: project.status,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      address: project.address,
      municipality_id: project.municipality_id,
      assigned_professionals: project.professionals ? project.professionals.map(p => p.id) : []
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    
    try {
      const response = await updateProject(currentProject.id, projectForm);
      setProjects(projects.map(p => 
        p.id === currentProject.id ? response : p
      ));
      setShowEditModal(false);
      resetProjectForm();
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated documents.')) {
      try {
        await deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        setError('Failed to delete project. Please try again.');
        console.error('Error deleting project:', err);
      }
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !documentFile || !selectedTemplateId) {
      setError('Please select a template and upload a file.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('project_id', String(currentProject.id));
      formData.append('template_id', String(selectedTemplateId));
      
      await uploadDocument(formData);
      // Refresh project data to show new documents
      const updatedProject = await getProjectById(currentProject.id);
      setProjects(projects.map(p => 
        p.id === currentProject.id ? updatedProject : p
      ));
      setShowDocumentModal(false);
      setDocumentFile(null);
      setSelectedTemplateId(null);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      console.error('Error uploading document:', err);
    }
  };

  const generateProjectDocument = async (projectId: number, templateId: number) => {
    try {
      await generateDocument(projectId, templateId);
      // Refresh project data to show generated document
      const updatedProject = await getProjectById(projectId);
      setProjects(projects.map(p => 
        p.id === projectId ? updatedProject : p
      ));
    } catch (err) {
      setError('Failed to generate document. Please try again.');
      console.error('Error generating document:', err);
    }
  };

  const openDocumentModal = (project: Project) => {
    setCurrentProject(project);
    setShowDocumentModal(true);
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Draft:
        return 'bg-gray-200 text-gray-800';
      case ProjectStatus.InProgress:
        return 'bg-blue-200 text-blue-800';
      case ProjectStatus.UnderReview:
        return 'bg-yellow-200 text-yellow-800';
      case ProjectStatus.Approved:
        return 'bg-green-200 text-green-800';
      case ProjectStatus.Rejected:
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Management</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            resetProjectForm();
            setShowAddModal(true);
          }}
        >
          Create New Project
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
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">No projects found. Create your first project to get started.</p>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold">{project.title}</h2>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.start_date && `Start: ${new Date(project.start_date).toLocaleDateString()}`}
                      {project.end_date && ` | End: ${new Date(project.end_date).toLocaleDateString()}`}
                    </p>
                    <p className="mt-2">{project.description}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Address: {project.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      Municipality: {municipalities.find(m => m.id === project.municipality_id)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => openDocumentModal(project)}
                    >
                      Submit Document
                    </button>
                    <button 
                      className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => handleEditProject(project)}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-md font-medium">Assigned Professionals:</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.professionals && project.professionals.length > 0 ? (
                      project.professionals.map(prof => (
                        <div key={prof.id} className="bg-blue-50 px-3 py-1 rounded-full text-sm">
                          {prof.name} ({professionalTypes.find(pt => pt.id === prof.professional_type_id)?.name || 'Unknown'})
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No professionals assigned</span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-medium">Available Templates:</h3>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full bg-white border">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">Template Name</th>
                          <th className="py-2 px-4 border-b">Municipality</th>
                          <th className="py-2 px-4 border-b">Professional Type</th>
                          <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentTemplates
                          .filter(t => t.municipality_id === project.municipality_id)
                          .length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 px-4 text-center">No templates available for this municipality</td>
                          </tr>
                        ) : (
                          documentTemplates
                            .filter(t => t.municipality_id === project.municipality_id)
                            .map(template => (
                              <tr key={template.id}>
                                <td className="py-2 px-4 border-b">{template.template_name}</td>
                                <td className="py-2 px-4 border-b">
                                  {municipalities.find(m => m.id === template.municipality_id)?.name || 'Unknown'}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  {professionalTypes.find(pt => pt.id === template.professional_type_id)?.name || 'Unknown'}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  <button 
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => generateProjectDocument(project.id, template.id)}
                                  >
                                    Generate
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {project.generated_documents && project.generated_documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium">Generated Documents:</h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full bg-white border">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b">Document Name</th>
                            <th className="py-2 px-4 border-b">Generated Date</th>
                            <th className="py-2 px-4 border-b">Status</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.generated_documents.map(doc => (
                            <tr key={doc.id}>
                              <td className="py-2 px-4 border-b">{doc.document_name}</td>
                              <td className="py-2 px-4 border-b">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-4 border-b">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  doc.is_approved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {doc.is_approved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-2 px-4 border-b">
                                <a 
                                  href={`/api/documents/download/${doc.file_id}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  Download
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleAddProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={projectForm.title} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="description" 
                    value={projectForm.description} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input 
                      type="date" 
                      name="start_date" 
                      value={projectForm.start_date} 
                      onChange={handleProjectInputChange} 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input 
                      type="date" 
                      name="end_date" 
                      value={projectForm.end_date} 
                      onChange={handleProjectInputChange} 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={projectForm.address} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Municipality</label>
                  <select 
                    name="municipality_id" 
                    value={projectForm.municipality_id} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Municipality</option>
                    {municipalities.map(municipality => (
                      <option key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned Professionals</label>
                  <select 
                    multiple
                    value={projectForm.assigned_professionals.map(String)}
                    onChange={handleProfessionalsChange}
                    className="w-full p-2 border rounded h-40"
                  >
                    {professionals.map(professional => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name} ({professionalTypes.find(pt => pt.id === professional.professional_type_id)?.name || 'Unknown'})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple professionals</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    name="status" 
                    value={projectForm.status} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    {Object.values(ProjectStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowAddModal(false);
                    resetProjectForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={projectForm.title} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="description" 
                    value={projectForm.description} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input 
                      type="date" 
                      name="start_date" 
                      value={projectForm.start_date} 
                      onChange={handleProjectInputChange} 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input 
                      type="date" 
                      name="end_date" 
                      value={projectForm.end_date} 
                      onChange={handleProjectInputChange} 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={projectForm.address} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Municipality</label>
                  <select 
                    name="municipality_id" 
                    value={projectForm.municipality_id} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="1">Select Municipality </option>
                    {municipalities.map(municipality => (
                      <option key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned Professionals</label>
                  <select 
                    multiple
                    value={projectForm.assigned_professionals.map(String)}
                    onChange={handleProfessionalsChange}
                    className="w-full p-2 border rounded h-40"
                  >
                    {professionals.map(professional => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name} ({professionalTypes.find(pt => pt.id === professional.professional_type_id)?.name || 'Unknown'})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple professionals</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    name="status" 
                    value={projectForm.status} 
                    onChange={handleProjectInputChange} 
                    className="w-full p-2 border rounded"
                    required
                  >
                    {Object.values(ProjectStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowEditModal(false);
                    resetProjectForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Submit Document</h2>
            <form onSubmit={handleUploadDocument}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Document Template</label>
                  <select 
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(parseInt(e.target.value, 10) || null)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Template</option>
                    {documentTemplates
                      .filter(t => t.municipality_id === (currentProject?.municipality_id || 0))
                      .map(template => (
                        <option key={template.id} value={template.id}>
                          {template.template_name} ({professionalTypes.find(pt => pt.id === template.professional_type_id)?.name || 'Unknown'})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Document File</label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                    onChange={handleDocumentFileChange} 
                    className="w-full p-2 border rounded"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowDocumentModal(false);
                    setDocumentFile(null);
                    setSelectedTemplateId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement; 