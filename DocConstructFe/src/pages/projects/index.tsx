import React, { useEffect, useState } from 'react';
import { get_all_projects } from '../../api';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FaBuilding, FaPlus, FaSort, FaHammer, FaHome } from 'react-icons/fa';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import LoadingIndicator from '../../components/shared/LoadingIndicator';
import {
  TopPanel,
  TopPanelLogo,
  PageContainer,
  TopPanelGroup,
  PageTitle,
  PageContent,
  TopPanelPanelButton
} from '../../styles/SharedStyles';
import { Project, ProjectStatus } from "../../types";

const ProjectCard = styled.div`
  background: white;
  border: 2px solid rgb(80, 111, 145);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  text-align: right;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectName = styled.h2`
  font-size: 22px;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 12px;
  font-weight: 500;
`;

const ProjectInfo = styled.p`
  font-size: 16px;
  color: #4a4a4a;
  margin: 8px 0;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
`;

const EmptyStateIcon = styled(FaBuilding)`
  font-size: 64px;
  color: #ccc;
  margin-bottom: 24px;
`;

const EmptyStateText = styled.p`
  font-size: 24px;
  color: #666;
  margin-bottom: 24px;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 18px;
  text-align: right;
`;

const StatusBadge = styled.div<{ status: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case ProjectStatus.DRAFT:
        return '#e3f2fd';
      case ProjectStatus.IN_PROGRESS:
        return '#fff8e1';
      case ProjectStatus.APPROVED:
        return '#e8f5e9';
      case ProjectStatus.REJECTED:
        return '#ffebee';
      case ProjectStatus.COMPLETED:
        return '#e0f2f1';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case ProjectStatus.DRAFT:
        return '#1565c0';
      case ProjectStatus.IN_PROGRESS:
        return '#f57c00';
      case ProjectStatus.APPROVED:
        return '#2e7d32';
      case ProjectStatus.REJECTED:
        return '#c62828';
      case ProjectStatus.COMPLETED:
        return '#00695c';
      default:
        return '#616161';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case ProjectStatus.DRAFT:
        return '#bbdefb';
      case ProjectStatus.IN_PROGRESS:
        return '#ffe082';
      case ProjectStatus.APPROVED:
        return '#c8e6c9';
      case ProjectStatus.REJECTED:
        return '#ffcdd2';
      case ProjectStatus.COMPLETED:
        return '#b2dfdb';
      default:
        return '#e0e0e0';
    }
  }};
`;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await get_all_projects();
      setProjects(sortProjects(data));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('נכשל בהבאת הפרויקטים');
    } finally {
      setLoading(false);
    }
  };

  const sortProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) =>
      sortOrder === 'asc'
        ? new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        : new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }

  const handleSortOrderChange = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  useEffect(() => {
    fetchProjects();
  }, [sortOrder]);

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const handleProjectAdded = () => {
    fetchProjects();
    setShowCreateModal(false);  // Close the modal after successful addition
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'לא זמין';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case ProjectStatus.DRAFT:
        return 'טיוטה';
      case ProjectStatus.IN_PROGRESS:
        return 'בתהליך';
      case ProjectStatus.APPROVED:
        return 'מאושר';
      case ProjectStatus.REJECTED:
        return 'נדחה';
      case ProjectStatus.COMPLETED:
        return 'הושלם';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelGroup>
          <TopPanelPanelButton onClick={() => setShowCreateModal(true)}>
            צור פרויקט חדש
            <FaPlus/>
          </TopPanelPanelButton>
          <TopPanelPanelButton onClick={handleSortOrderChange}>
            מיין לפי תאריך
            <FaSort/>
          </TopPanelPanelButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent>
        <PageTitle>פרויקטים</PageTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {loading ? (
          <LoadingIndicator text="טוען פרויקטים..." type="construction" />
        ) : projects.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon/>
            <EmptyStateText>אין פרויקטים זמינים</EmptyStateText>
          </EmptyState>
        ) : (
          <ProjectGrid id='project-grid'>
            {projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                onClick={() => handleProjectClick(project.project_id)}
              >
                <StatusBadge status={project.status || 'draft'}>
                  {getStatusLabel(project.status)}
                </StatusBadge>
                <ProjectName><b>{project.name}</b></ProjectName>
                <ProjectInfo><b>כתובת: {project.address}</b></ProjectInfo>
                <ProjectInfo><b>רשות: {project.municipality?.name || 'לא זמין'}</b></ProjectInfo>
                <ProjectInfo><b>תאריך: {formatDate(project.created_at)}</b></ProjectInfo>
                {project.professional_associations && (
                  <ProjectInfo><b>אנשי מקצוע: {project.professional_associations.length}</b></ProjectInfo>
                )}
              </ProjectCard>
            ))}
          </ProjectGrid>
        )}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onProjectAdded={handleProjectAdded}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default Projects; 