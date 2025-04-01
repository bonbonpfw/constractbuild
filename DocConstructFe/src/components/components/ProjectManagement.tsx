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
  GeneratedDocument,
  ProjectProfessional
} from '../types';
import { FaPlus } from 'react-icons/fa';

interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  address: string;
  municipality_id: number;
  assigned_professionals: number[];
}

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
  
  const [projectForm, setProjectForm] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: ProjectStatus.DRAFT,
    start_date: '',
    end_date: '',
    address: '',
    municipality_id: 0,
    assigned_professionals: []
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
      name: '',
      description: '',
      status: ProjectStatus.DRAFT,
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
    } else if (name === 'status') {
      setProjectForm({
        ...projectForm,
        [name]: value as ProjectStatus
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
      name: project.name,
      description: project.description || '',
      status: project.status as ProjectStatus || ProjectStatus.DRAFT,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      address: project.address,
      municipality_id: project.municipality_id,
      assigned_professionals: project.professional_associations ? project.professional_associations.map(pa => pa.professional_id) : []
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    
    try {
      const response = await updateProject(currentProject.project_id, projectForm);
      setProjects(projects.map(p => 
        p.project_id === currentProject.project_id ? response : p
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
        setProjects(projects.filter(p => p.project_id !== id));
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
      formData.append('project_id', String(currentProject.project_id));
      formData.append('template_id', String(selectedTemplateId));
      
      await uploadDocument(formData);
      // Refresh project data to show new documents
      const updatedProject = await getProjectById(currentProject.project_id);
      setProjects(projects.map(p => 
        p.project_id === currentProject.project_id ? updatedProject : p
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
        p.project_id === projectId ? updatedProject : p
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
      case ProjectStatus.DRAFT:
        return 'bg-gray-200 text-gray-800';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-blue-200 text-blue-800';
      case ProjectStatus.APPROVED:
        return 'bg-green-200 text-green-800';
      case ProjectStatus.REJECTED:
        return 'bg-red-200 text-red-800';
      case ProjectStatus.COMPLETED:
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleMunicipalityChange = async (projectId: number, municipalityId: number) => {
    try {
      const response = await updateProject(projectId, { municipality_id: municipalityId });
      setProjects(projects.map(p => 
        p.project_id === projectId ? response : p
      ));
    } catch (err) {
      setError('Failed to update municipality. Please try again.');
      console.error('Error updating municipality:', err);
    }
  };

  const renderProjectList = () => (
    <div className="grid gap-6">
      {projects.map(project => (
        <div key={project.project_id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <span className={`px-2 py-1 rounded-full ${getStatusBadgeClass(project.status as ProjectStatus)}`}>
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold">Municipality</h3>
              <select
                value={project.municipality_id}
                onChange={(e) => handleMunicipalityChange(project.project_id, parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                {municipalities.map((municipality) => (
                  <option key={municipality.municipality_id} value={municipality.municipality_id}>
                    {municipality.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="font-semibold">Professionals</h3>
              <div className="mt-1">
                {project.professional_associations?.map((pa) => (
                  <div key={pa.professional_id} className="text-sm">
                    {pa.professional?.name} ({pa.professional?.professional_type?.type_name})
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleEditProject(project)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteProject(project.project_id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => openDocumentModal(project)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Upload Document
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfessionalSelect = () => (
    <select
      multiple
      name="assigned_professionals"
      value={projectForm.assigned_professionals.map(String)}
      onChange={handleProfessionalsChange}
      className="w-full p-2 border rounded"
    >
      {professionals.map(professional => (
        <option key={professional.professional_id} value={professional.professional_id}>
          {professional.name} ({professional.professional_type?.type_name})
        </option>
      ))}
    </select>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          aria-label="Add New Project"
        >
          <FaPlus size={20} />
        </button>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        renderProjectList()
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
            <form onSubmit={handleAddProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={projectForm.name}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={projectForm.status}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {Object.values(ProjectStatus).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={projectForm.start_date}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={projectForm.end_date}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
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
                  <label className="block text-sm font-medium text-gray-700">Municipality</label>
                  <select
                    name="municipality_id"
                    value={projectForm.municipality_id}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Municipality</option>
                    {municipalities.map(municipality => (
                      <option key={municipality.municipality_id} value={municipality.municipality_id}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Professionals</label>
                  {renderProfessionalSelect()}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={projectForm.name}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={projectForm.status}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {Object.values(ProjectStatus).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={projectForm.start_date}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={projectForm.end_date}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
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
                  <label className="block text-sm font-medium text-gray-700">Municipality</label>
                  <select
                    name="municipality_id"
                    value={projectForm.municipality_id}
                    onChange={handleProjectInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Municipality</option>
                    {municipalities.map(municipality => (
                      <option key={municipality.municipality_id} value={municipality.municipality_id}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Professionals</label>
                  {renderProfessionalSelect()}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetProjectForm();
                  }}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showDocumentModal && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
            <form onSubmit={handleUploadDocument}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Template</label>
                  <select
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(parseInt(e.target.value, 10))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Template</option>
                    {documentTemplates.map(template => (
                      <option key={template.template_id} value={template.template_id}>
                        {template.template_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Document File</label>
                  <input
                    type="file"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedTemplateId(null);
                    setDocumentFile(null);
                  }}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload
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