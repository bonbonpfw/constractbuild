import React, { useState, useEffect } from 'react';
import { getProjects, createProject } from '../api';
import { Project, ProjectStatus } from '../types';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FaPlus, FaSort } from 'react-icons/fa';
import CreateProject from './projects/CreateProject';
import {
  TopPanel,
  TopPanelLogo,
  PageContainer,
  TopPanelGroup,
  PageTitle,
  PageContent,
  TopPanelPanelButton,
  ErrorMessage,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText
} from '../styles/SharedStyles';


const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
`;

const ProjectCard = styled.div`
  background: white;
  border: 2px solid rgb(80, 111, 145);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectName = styled.h2`
  font-size: 22px;
  color: #0A2540;
  margin-bottom: 12px;
`;

const ProjectInfo = styled.p`
  font-size: 16px;
  color: #4a4a4a;
  margin: 8px 0;
`;

const StatusBadge = styled.span<{ status: ProjectStatus }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${({ status }) => {
    switch (status) {
      case ProjectStatus.PRE_PERMIT:
        return '#fff3cd';
      case ProjectStatus.IN_PROGRESS:
        return '#cfe2ff';
      case ProjectStatus.APPROVED:
        return '#d1e7dd';
      case ProjectStatus.REJECTED:
        return '#f8d7da';
      case ProjectStatus.COMPLETED:
        return '#e2e3e5';
      default:
        return '#e9ecef';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case ProjectStatus.PRE_PERMIT:
        return '#856404';
      case ProjectStatus.IN_PROGRESS:
        return '#084298';
      case ProjectStatus.APPROVED:
        return '#0f5132';
      case ProjectStatus.REJECTED:
        return '#842029';
      case ProjectStatus.COMPLETED:
        return '#41464b';
      default:
        return '#383d41';
    }
  }};
`;

const ActionButton = styled(TopPanelPanelButton)`
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  margin-left: 8px;
  height: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f5f5f5;
    border-color: #d0d0d0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 12px;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background-color: #2563eb;
  color: white;
  border: none;
  font-weight: 500;

  &:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  }
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-right: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f5f5f5;
    border-color: #d0d0d0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 14px;
  }
`;

const PrimaryIconButton = styled(IconButton)`
  background-color: #2563eb;
  color: white;
  border: none;
  font-weight: 500;

  &:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 24px;
`;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProjects();
      if (response && response.projects && Array.isArray(response.projects)) {
        setProjects(response.projects);
      } else {
        throw new TypeError('Expected an array of projects in the response');
      }
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleSortOrderChange = () => {
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setProjects(sortedProjects);
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await createProject(projectData);
      setProjects(prev => [...prev, newProject]);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Error creating project:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelGroup>
          <IconButton onClick={handleSortOrderChange} title="מיין לפי תאריך">
            <FaSort />
          </IconButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent>
        <PageHeader>
          <PageTitle>פרויקטים</PageTitle>
          <PrimaryIconButton 
            onClick={() => setShowCreateModal(true)} 
            title="צור פרויקט חדש"
          >
            <FaPlus />
          </PrimaryIconButton>
        </PageHeader>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && !isLoading && projects.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon/>
            <EmptyStateText>אין פרויקטים זמינים</EmptyStateText>
          </EmptyState>
        ) : (
          <ProjectGrid>
            {projects.map((project) => (
              <ProjectCard 
                key={project.project_id}
                onClick={() => handleProjectClick(project.project_id)}
              >
                <ProjectName>{project.project_name}</ProjectName>
                <ProjectInfo>Case ID: {project.project_case_id}</ProjectInfo>
                <StatusBadge status={project.project_status}>
                  {project.project_status}
                </StatusBadge>
              </ProjectCard>
            ))}
          </ProjectGrid>
        )}
      </PageContent>
      <CreateProject
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </PageContainer>
  );
};

export default Projects;