import React, {useEffect, useState} from 'react';
import { getProjects } from '../../api';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FaPlus } from 'react-icons/fa';
import {
  TopPanel,
  TopPanelLogo,
  PageContainer,
  TopPanelGroup,
  PageContent,
  IconButton, TopPanelTitleHolder, TopPanelTitle, CardGrid, Card, CardName, CardInfo
} from '../../styles/SharedStyles';
import { Project, ProjectStatus } from "../../types";
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
        return 'טיוטה';
      case ProjectStatus.POST_PERMIT:
        return 'מאושר';
      case ProjectStatus.FINAL:
        return 'הושלם';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>Projects</TopPanelTitle>
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
                <CardName><b>{project.name}</b></CardName>
                <CardInfo><b>כתובת: {project.address}</b></CardInfo>
                <CardInfo><b>תאריך יעד: {formatDate(project.due_date)}</b></CardInfo>
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
