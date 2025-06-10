import React, {useEffect, useState} from 'react';
import { getProjects } from '../../api';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FaPlus, FaExclamationTriangle, FaTh, FaList } from 'react-icons/fa';
import {
  TopPanel,
  TopPanelLogo,
  PageContainer,
  TopPanelGroup,
  PageContent,
  IconButton,
  TopPanelTitleHolder,
  TopPanelTitle,
  CardGrid,
  Card,
  CardName,
  CardInfo,
  Table,
  TableHeader,
  TableBody
} from '../../styles/SharedStyles';
import { Project, ProjectStatus, ProfessionalStatus, ProjectTeamRole } from "../../types";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import ProjectCreationDialog from "./ProjectCreationDialog";

type ViewMode = 'cards' | 'table';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectCreationDialog, setShowProjectCreationDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
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

  const renderCardView = () => (
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
          <CardInfo><b>בעל היתר:</b> {project.team_members?.find(member => member.role === ProjectTeamRole.PERMIT_OWNER)?.name || 'לא זמין'}</CardInfo>
          <CardInfo><b>מספר היתר:</b> {project.permit_number || 'לא זמין'}</CardInfo>
        </Card>
      ))}
    </CardGrid>
  );

  const renderTableView = () => (
    <Table>
      <thead>
        <tr>
          <TableHeader>שם פרויקט</TableHeader>
          <TableHeader>בעל היתר</TableHeader>
          <TableHeader>סטטוס</TableHeader>
          <TableHeader>מספר היתר</TableHeader>
          <TableHeader>התראות</TableHeader>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr 
            key={project.id} 
            onClick={() => handleProjectClick(project.id)}
            style={{ cursor: 'pointer' }}
          >
            <TableBody><b>{project.name}</b></TableBody>
            <TableBody>{project.team_members?.find(member => member.role === ProjectTeamRole.PERMIT_OWNER)?.name || 'לא זמין'}</TableBody>
            <TableBody>
              <TableStatusBadge status={project.status || 'draft'}>
                {getStatusLabel(project.status)}
              </TableStatusBadge>
            </TableBody>
            <TableBody>{project.permit_number || 'לא זמין'}</TableBody>
            <TableBody>
              {project.is_expired && (
                <TableWarningBadge color="#d32f2f" title="יש בעלי מקצוע עם רישיון שפג תוקף!">
                  <FaExclamationTriangle />
                </TableWarningBadge>
              )}
              {!project.is_expired && project.is_warning && (
                <TableWarningBadge color="#f57c00" title="יש בעלי מקצוע עם רישיון שעומד לפוג (פחות מחודש)!">
                  <FaExclamationTriangle />
                </TableWarningBadge>
              )}
            </TableBody>
          </tr>
        ))}
      </tbody>
    </Table>
  );

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
      <PageContent style={{ flexDirection: 'column' }}>
        {projects.length === 0 ? (
          <EmptyStatePlaceholder msg='No projects available' />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#4b6b8e' }}>פרויקטים ({projects.length})</h2>
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                title={viewMode === 'cards' ? 'עבור לתצוגת טבלה' : 'עבור לתצוגת כרטיסים'}
                style={{
                  background: 'transparent',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {viewMode === 'cards' ? <FaList /> : <FaTh />}
              </button>
            </div>
            {viewMode === 'cards' ? renderCardView() : renderTableView()}
          </>
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

const TableStatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
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

const TableWarningBadge = styled.span<{ color?: string }>`
  font-size: 16px;
  color: ${props => props.color || '#f57c00'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  font-weight: bold;
`;
