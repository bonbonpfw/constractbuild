import React, {useEffect, useState} from 'react';
import { getProjects } from '../../api';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { FaPlus, FaExclamationTriangle, FaTh, FaList, FaSearch } from 'react-icons/fa';
import {
  TopPanel,
  TopPanelLogo,
  PageContainer,
  TopPanelGroup,
  PageContent,
  IconButton,
  TopPanelTitleHolder,
  TopPanelTitle,
} from '../../styles/SharedStyles';
import { Project, ProjectStatus, ProfessionalStatus, ProjectTeamRole } from "../../types";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import ProjectCreationDialog from "./ProjectCreationDialog";

type ViewMode = 'cards' | 'table';

// Styled Components that need to be defined early
const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #4b6b8e;
  border: 1px solid #4b6b8e;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #3a5a7d;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjectCreationDialog, setShowProjectCreationDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.permit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.team_members?.some(member => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

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

  const renderCardView = () => (
    <CardsContainer>
      {filteredProjects.map((project) => (
        <ProjectCard
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

          <CardContent>
            <ProjectName>{project.name}</ProjectName>
            <ProjectInfo>
              <InfoRow>
                <InfoLabel>בעל היתר:</InfoLabel>
                <InfoValue>{project.team_members?.find(member => member.role === ProjectTeamRole.PERMIT_OWNER)?.name || 'לא זמין'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>מסמכים חסרים:</InfoLabel>
                <InfoValue>
                  {project.missing_start_work_docs === 0 ? (
                    <span style={{ color: '#2e7d32', fontWeight: '500' }}>הושלם</span>
                  ) : (
                    <span style={{ color: '#d32f2f', fontWeight: '500' }}>
                      {project.missing_start_work_docs || 0} מסמכים
                    </span>
                  )}
                </InfoValue>
              </InfoRow>
            </ProjectInfo>
          </CardContent>
        </ProjectCard>
      ))}
    </CardsContainer>
  );

  const renderTableView = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <TableHeader>שם פרויקט</TableHeader>
            <TableHeader>בעל היתר</TableHeader>
            <TableHeader>סטטוס</TableHeader>
            <TableHeader>מספר היתר</TableHeader>
            <TableHeader>מספר בקשה</TableHeader>
            <TableHeader>מסמכים חסרים</TableHeader>
            <TableHeader>התראות</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project) => (
            <TableRow 
              key={project.id} 
              onClick={() => handleProjectClick(project.id)}
            >
              <TableCell><strong>{project.name}</strong></TableCell>
              <TableCell>{project.team_members?.find(member => member.role === ProjectTeamRole.PERMIT_OWNER)?.name || 'לא זמין'}</TableCell>
              <TableCell>
                <TableStatusBadge status={project.status || 'draft'}>
                  {getStatusLabel(project.status)}
                </TableStatusBadge>
              </TableCell>
              <TableCell>{project.permit_number || 'לא זמין'}</TableCell>
              <TableCell>{project.request_number || 'לא זמין'}</TableCell>
              <TableCell>
                {project.missing_start_work_docs === 0 ? (
                  <span style={{ color: '#2e7d32', fontWeight: '500' }}>הושלם</span>
                ) : (
                  <span style={{ color: '#d32f2f', fontWeight: '500' }}>
                    {project.missing_start_work_docs || 0} מסמכים
                  </span>
                )}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <FixedPageContainer>
        <TopPanel>
          <TopPanelLogo/>
          <TopPanelTitleHolder>
            <TopPanelTitle>ניהול פרויקטים ליזמים</TopPanelTitle>
          </TopPanelTitleHolder>
        </TopPanel>
        <PageContent>
          <LoadingState>טוען נתונים...</LoadingState>
        </PageContent>
      </FixedPageContainer>
    );
  }

  return (
    <FixedPageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>ניהול פרויקטים ליזמים</TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
        </TopPanelGroup>
      </TopPanel>
      <PageContent style={{ flexDirection: 'column' }}>
        {projects.length === 0 ? (
          <EmptyStatePlaceholder msg='אין פרויקטים זמינים' />
        ) : (
          <ContentContainer>
            {/* Header */}
            <ContentHeader>
              <HeaderLeft>
                <Title>פרויקטים</Title>
                <Separator>•</Separator>
                <Badge>{filteredProjects.length}</Badge>
              </HeaderLeft>

              <HeaderRight>
                <AddButton onClick={() => setShowProjectCreationDialog(true)}>
                  <FaPlus />
                  הוסף פרויקט
                </AddButton>
                <ViewToggleContainer>
                  <ViewToggleButton
                    active={viewMode === 'cards'}
                    onClick={() => setViewMode('cards')}
                    title="תצוגת כרטיסים"
                  >
                    <FaTh />
                  </ViewToggleButton>
                  <ViewToggleButton
                    active={viewMode === 'table'}
                    onClick={() => setViewMode('table')}
                    title="תצוגת טבלה"
                  >
                    <FaList />
                  </ViewToggleButton>
                </ViewToggleContainer>
              </HeaderRight>
            </ContentHeader>

            {/* Search */}
            <SearchContainer>
              <SearchInputContainer>
                <SearchIcon />
                <SearchInput
                  placeholder="חפש פרויקטים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchInputContainer>
            </SearchContainer>

            {/* Content */}
            {filteredProjects.length === 0 ? (
              <EmptyState>לא נמצאו פרויקטים התואמים לחיפוש</EmptyState>
            ) : (
              viewMode === 'cards' ? renderCardView() : renderTableView()
            )}
          </ContentContainer>
        )}
        {showProjectCreationDialog && (
          <ProjectCreationDialog
            onClose={() => setShowProjectCreationDialog(false)}
            onSuccess={handleProjectAdded}
          />
        )}
      </PageContent>
    </FixedPageContainer>
  );
};

export default Projects;

// Styled Components
const FixedPageContainer = styled(PageContainer)`
  height: auto;
  flex: 1;
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: #4b6b8e;
`;

const Separator = styled.span`
  color: #6b7280;
`;

const Badge = styled.span`
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ViewToggleContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: ${props => props.active ? '#4b6b8e' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#3a5a7d' : '#f9fafb'};
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const SearchContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb50;
`;

const SearchInputContainer = styled.div`
  position: relative;
  max-width: 24rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #4b6b8e;
    box-shadow: 0 0 0 3px rgba(75, 107, 142, 0.1);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 200px;
  max-height: calc(100vh - 300px);
`;

const ProjectCard = styled.div`
  position: relative;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4b6b8e;
    border-width: 2px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const StatusBadge = styled.div<{ status: string }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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
  top: 1rem;
  right: 1rem;
  font-size: 1.125rem;
  color: ${props => props.color || '#f57c00'};
  cursor: help;
`;

const CardContent = styled.div`
  margin-top: 2.5rem;
`;

const ProjectName = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #4b6b8e;
`;

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #4b6b8e;
  text-align: right;
`;

const TableContainer = styled.div`
  overflow-y: auto;
  overflow-x: auto;
  flex: 1;
  min-height: 200px;
  max-height: calc(100vh - 300px);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1.5rem;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  text-align: right;
`;

const TableStatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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

const TableWarningBadge = styled.span<{ color?: string }>`
  font-size: 1rem;
  color: ${props => props.color || '#f57c00'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1rem;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1rem;
`;
