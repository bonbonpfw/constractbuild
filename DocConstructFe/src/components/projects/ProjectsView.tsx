import React, {useEffect, useState} from 'react';
import { getProjects } from '../../api';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import {
  TopPanel,
  TopPanelLogo,
  PageContainer,
  TopPanelGroup,
  PageContent,
  IconButton, TopPanelTitleHolder, TopPanelTitle, CardGrid, Card, CardName, CardInfo
} from '../../styles/SharedStyles';
import { Project, ProjectStatus, ProfessionalStatus } from "../../types";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import ProjectCreationDialog from "./ProjectCreationDialog";

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectCreationDialog, setShowProjectCreationDialog] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = async (projectId: string) => {
    await router.push(`/projects/${projectId}`);
  };

  const handleProjectAdded = async () => {
    await fetchProjects();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'לא זמין';

    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case ProjectStatus.PRE_PERMIT:
        return 'קדם היתר';
      case ProjectStatus.POST_PERMIT:
        return 'אחרי היתר';
      case ProjectStatus.FINAL:
        return 'הושלם';
      default:
        return 'לא ידוע';
    }
  };

  // Function to check if any professional in the project has Warning or Expired status
  const hasWarningOrExpiredProfessionals = (project: Project) => {
    // If the backend directly provides warning/expired flags
    if ('is_warning' in project || 'is_expired' in project) {
      return project.is_warning || project.is_expired;
    }
    
    // Otherwise check professional statuses
    if (!project.professionals || project.professionals.length === 0) {
      return false;
    }
    
    return project.professionals.some(professional => 
      professional.status === ProfessionalStatus.WARNING || 
      professional.status === ProfessionalStatus.EXPIRED
    );
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>ניהול פרויקטים ליזמים</TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
          <IconButton onClick={() => setShowProjectCreationDialog(true)}>
            <FaPlus/>
          </IconButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent>
        {projects.length === 0 ? (
          <EmptyStatePlaceholder msg='No projects available' />
        ) : (
          <CardGrid>
            {projects.map((project) => (
              <Card
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
              >
                <StatusBadge status={project.status || 'draft'}>
                  {getStatusLabel(project.status)}
                </StatusBadge>
                {project.is_expired && (
                  <WarningBadge color="#d32f2f" title="יש בעלי מקצוע עם רישיון שפג תוקף!">
                    <FaExclamationTriangle />
                  </WarningBadge>
                )}
                {!project.is_expired && project.is_warning && (
                  <WarningBadge color="#f57c00" title="יש בעלי מקצוע עם רישיון שעומד לפוג (פחות מחודש)!">
                    <FaExclamationTriangle />
                  </WarningBadge>
                )}
                <CardName><b>{project.name}</b></CardName>
                <CardInfo><b>בעל ההיתר: {project.permit_owner}</b></CardInfo>
                <CardInfo><b>תאריך יעד: {formatDate(project.status_due_date)}</b></CardInfo>
              </Card>
            ))}
          </CardGrid>
        )}
        {showProjectCreationDialog && (
          <ProjectCreationDialog
            onClose={() => setShowProjectCreationDialog(false)}
            onSuccess={handleProjectAdded}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default Projects;

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
      case ProjectStatus.PRE_PERMIT:
        return '#e3f2fd';
      case ProjectStatus.POST_PERMIT:
        return '#e8f5e9';
      case ProjectStatus.FINAL:
        return '#e0f2f1';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case ProjectStatus.PRE_PERMIT:
        return '#1565c0';
      case ProjectStatus.POST_PERMIT:
        return '#2e7d32';
      case ProjectStatus.FINAL:
        return '#00695c';
      default:
        return '#616161';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case ProjectStatus.PRE_PERMIT:
        return '#bbdefb';
      case ProjectStatus.POST_PERMIT:
        return '#c8e6c9';
      case ProjectStatus.FINAL:
        return '#b2dfdb';
      default:
        return '#e0e0e0';
    }
  }};
`;

const WarningBadge = styled.div<{ color?: string }>`
  position: absolute;
  top: 15px;
  right: 22px;
  font-size: 18px;
  color: ${props => props.color || '#f57c00'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  font-weight: bold;
`;
