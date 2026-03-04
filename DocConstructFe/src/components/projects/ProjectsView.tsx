import React, {useEffect, useMemo, useState} from 'react';
import { getProjects, ServiceType, SERVICE_TYPE_OPTIONS } from '../../api';
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
import { Project, ProjectStatus, ProfessionalStatus, ProjectTeamRole, DocumentState } from "../../types";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import ProjectCreationDialog from "./ProjectCreationDialog";
import { CITY_LABELS } from "./ProjectCreationDialog";
import SortableTableHeader from "../shared/SortableTableHeader";
import useSort from "../../hooks/useSort";

const SearchInput = styled.input`
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #dbe4f0;
  background: #ffffff;
  color: #314a67;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover { border-color: #c6d4e6; }
  &:focus {
    border-color: #9bb4d6;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  }
`;

const ViewToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  padding: 0;
  border-radius: 8px;
  background: #f6f9fc;
  border: 1px solid #dbe4f0;
  color: #4b6b8e;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  &:hover {
    background: #eef3f9;
    border-color: #c6d4e6;
  }
  svg { font-size: 16px; }
  &:active { transform: translateY(0.5px); }
`;

const CitySelect = styled.select`
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #dbe4f0;
  background: #ffffff;
  color: #314a67;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover { border-color: #c6d4e6; }
  &:focus {
    border-color: #9bb4d6;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  }
`;

type ViewMode = 'cards' | 'table';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectCreationDialog, setShowProjectCreationDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();
  
  // Sorting functionality
  const { sortKey, sortDirection, handleSort, sortData } = useSort('name');

  // Derive cities and filtered projects
  const cities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      const city = p.city || '';
      if (city) set.add(city);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    // Filter by service type
    if (selectedServiceType !== 'all') {
      filtered = filtered.filter((p) => {
        const serviceTypes = Array.isArray(p.service_types) ? p.service_types : [];
        return serviceTypes.includes(selectedServiceType);
      });
    }
    
    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter((p) => {
        return (p.city || '') === selectedCity;
      });
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const requestNumber = (p.request_number || '').toLowerCase();
        return name.includes(term) || requestNumber.includes(term);
      });
    }

    // Sort by name א-ת
    filtered = [...filtered].sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    return filtered;
  }, [projects, selectedCity, selectedServiceType, searchTerm]);

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
        return 'אושר לתחילת עבודות';
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
      {filteredProjects.map((project) => (
        <Card
          key={project.id}
          onClick={() => handleProjectClick(project.id)}
        >
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
          <CardInfo><b>עיר:</b> {project.city ? (CITY_LABELS[project.city] ?? project.city) : 'לא זמין'}</CardInfo>
          <DocumentStatusBar project={project} />
        </Card>
      ))}
    </CardGrid>
  );

  const renderTableView = () => {
    // Sort projects based on current sort settings
    const sortedProjects = sortData(filteredProjects, (project, key) => {
      switch (key) {
        case 'name':
          return project.name;
        case 'permit_owner':
          return project.team_members?.find(member => member.role === ProjectTeamRole.PERMIT_OWNER)?.name || 'לא זמין';
        case 'status':
          return getStatusLabel(project.status);
        case 'permit_number':
          return project.permit_number || 'לא זמין';
        case 'city':
          return project.city || 'לא זמין';
        case 'warnings':
          // Sort by warning status (expired first, then warning, then none)
          if (project.is_expired) return 0;
          if (project.is_warning) return 1;
          return 2;
        default:
          return '';
      }
    });

    return (
      <Table>
        <thead>
          <tr>
            <SortableTableHeader
              sortKey="name"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              שם פרויקט
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="permit_owner"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              בעל היתר
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="status"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              סטטוס
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="permit_number"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              מספר היתר
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="city"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              עיר
            </SortableTableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((project) => (
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
              <TableBody>{project.city || 'לא זמין'}</TableBody>
            </tr>
          ))}
        </tbody>
      </Table>
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
      <PageContent style={{ flexDirection: 'column' }}>
        {projects.length === 0 ? (
          <EmptyStatePlaceholder msg='No projects available' />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#4b6b8e' }}>פרויקטים ({filteredProjects.length})</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <SearchInput
                  placeholder="חפש פרויקט"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CitySelect
                  value={selectedCity}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
                  title="סנן לפי עיר"
                >
                  <option value="all">כל הערים</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{CITY_LABELS[c] ?? c}</option>
                  ))}
                </CitySelect>
                <CitySelect
                  value={selectedServiceType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedServiceType(e.target.value)}
                  title="סנן לפי סוג שירות"
                >
                  <option value="all">כל סוגי השירות</option>
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </CitySelect>
                <ViewToggleButton
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  title={viewMode === 'cards' ? 'עבור לתצוגת טבלה' : 'עבור לתצוגת כרטיסים'}
                >
                  {viewMode === 'cards' ? <FaList /> : <FaTh />}
                </ViewToggleButton>
              </div>
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

 

// Component for document status bar with tooltip
const DocumentStatusBar: React.FC<{ project: Project }> = ({ project }) => {
  // Debug: Log project data
  console.log('DocumentStatusBar - Project:', project);
  console.log('DocumentStatusBar - Has documents?', Boolean(project.documents));
  
  // If no documents available, show empty indicator
  if (!project.documents || project.documents.length === 0) {
    console.log('No documents found, showing empty indicator');
    
    return (
      <div 
        style={{ 
          position: 'absolute',
          bottom: '12px',
          left: '10px',
          right: '10px',
          height: '4px',
          display: 'flex',
          borderRadius: '2px',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0' // Light gray background to show it's there
        }}
        title="אין נתוני מסמכים זמינים"
      />
    );
  }
  
  // Calculate document counts by status
  const getDocumentCounts = () => {
    const documents = project.documents || [];
    console.log('Documents:', documents);
    
    // For testing purposes, we'll create mock document counts
    // In a real scenario, this would come from the API
    const mockDocuments = [
      { status: 'Missing' },
      { status: 'Missing' },
      { status: 'Uploaded' },
      { status: 'Uploaded' },
      { status: 'Uploaded' },
      { status: 'Filled' },
      { status: 'Filled' },
      { status: 'Signed' },
    ];
    
    // Use real documents if available, otherwise use mock data
    const docsToUse = documents.length > 0 ? documents : mockDocuments;
    
    const categorizedDocs = docsToUse;
    const total = categorizedDocs.length;
    
    if (total === 0) return { missing: 0, uploaded: 0, filled: 0, signed: 0, total: 0 };
    
    // Count documents by status
    const missing = categorizedDocs.filter(doc => doc.status === 'Missing').length;
    const uploaded = categorizedDocs.filter(doc => doc.status === 'Uploaded').length;
    const filled = categorizedDocs.filter(doc => doc.status === 'Filled').length;
    const signed = categorizedDocs.filter(doc => doc.status === 'Signed').length;
    
    console.log('Document counts:', { missing, uploaded, filled, signed, total });
    
    return { missing, uploaded, filled, signed, total };
  };
  
  const { missing, uploaded, filled, signed, total } = getDocumentCounts();
  
  // If no documents, show at least a placeholder
  if (total === 0) {
    return (
      <div 
        style={{ 
          position: 'absolute',
          bottom: '12px',
          left: '10px',
          right: '10px',
          height: '4px',
          display: 'flex',
          borderRadius: '2px',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0' // Light gray background
        }}
        title="אין מסמכים מקוטלגים"
      />
    );
  }
  
  // Calculate percentages
  const missingPercent = total > 0 ? (missing / total) * 100 : 0;
  const uploadedPercent = total > 0 ? (uploaded / total) * 100 : 0;
  const filledPercent = total > 0 ? (filled / total) * 100 : 0;
  const signedPercent = total > 0 ? (signed / total) * 100 : 0;
  
  return (
    <div 
      style={{ 
        position: 'absolute',
        bottom: '12px',
        left: '10px',
        right: '10px',
        height: '4px',
        display: 'flex',
        borderRadius: '2px',
        overflow: 'hidden'
      }}
      title={`מסמכים: חסרים: ${missing}, ריקים: ${uploaded}, מלאים: ${filled}, חתומים: ${signed}, סה"כ: ${total}`}
    >
      {missing > 0 && (
        <div style={{ width: `${missingPercent}%`, backgroundColor: '#ff6b6b' }}></div>
      )}
      {uploaded > 0 && (
        <div style={{ width: `${uploadedPercent}%`, backgroundColor: '#0071e3' }}></div>
      )}
      {filled > 0 && (
        <div style={{ width: `${filledPercent}%`, backgroundColor: '#b0851f' }}></div>
      )}
      {signed > 0 && (
        <div style={{ width: `${signedPercent}%`, backgroundColor: '#1d8450' }}></div>
      )}
    </div>
  );
};
