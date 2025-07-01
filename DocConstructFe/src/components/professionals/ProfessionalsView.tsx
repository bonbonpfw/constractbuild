import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTh, FaList, FaSearch } from 'react-icons/fa';
import {
  getProfessionals, getProfessionalStatuses,
  getProfessionalTypes,
} from '../../api';
import { Professional, ProfessionalType, ProfessionalStatus } from '../../types';
import {
  IconButton,
  PageContainer,
  PageContent,
  TopPanel,
  TopPanelGroup,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder, 
} from '../../styles/SharedStyles';
import ProfessionalCreationDialog from "./ProfessionalCreationDialog";
import {useRouter} from "next/router";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";

type ViewMode = 'cards' | 'table';

// Styled Components that need to be defined early
const StatusBadge = styled.div<{ status: string }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#e8f5e9' :
    status === ProfessionalStatus.WARNING ? '#fffbdd' :
    status === ProfessionalStatus.EXPIRED ? '#ffeef0' :
    '#ffeef0'};
  color: ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#2e7d32' :
    status === ProfessionalStatus.WARNING ? '#735c0f' :
    status === ProfessionalStatus.EXPIRED ? '#cb2431' :
    '#cb2431'};
  border: 1px solid ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#c8e6c9' :
    status === ProfessionalStatus.WARNING ? '#f4e775' :
    status === ProfessionalStatus.EXPIRED ? '#f5b5ba' :
    '#f5b5ba'};
`;

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

const ProfessionalsView: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProfessionals(professionals);
    } else {
      const filtered = professionals.filter(professional =>
        professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.professional_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProfessionals(filtered);
    }
  }, [searchTerm, professionals]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const [professionalsData, typesData, statusesData] = await Promise.all([
        getProfessionals(),
        getProfessionalTypes(),
        getProfessionalStatuses()
      ]);
      setProfessionals(professionalsData);
      setFilteredProfessionals(professionalsData);
      setTypes(typesData);
      setStatuses(statusesData);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  const onProfessionalAdded = async () => {
    await fetchProfessionals();
    setShowAdd(false);
  };

  const handleProfessionalClick = (professionalId: string) => {
    push(`/professionals/${professionalId}`);
  };

  const renderCardView = () => (
    <CardsContainer>
      {filteredProfessionals.map((professional) => (
        <ProfessionalCard
          key={professional.id}
          onClick={() => handleProfessionalClick(professional.id)}
        >
          <StatusBadge status={professional.status}>
            {professional.status}
          </StatusBadge>

          <CardContent>
            <ProfessionalName>{professional.name}</ProfessionalName>
            <ProfessionalInfo>
              <InfoRow>
                <InfoLabel>מספר רישיון:</InfoLabel>
                <InfoValue>{professional.license_number || 'לא זמין'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>תפוגת רישיון:</InfoLabel>
                <InfoValue>
                  {professional.license_expiration_date 
                    ? new Date(professional.license_expiration_date).toLocaleDateString('he-IL') 
                    : 'לא זמין'
                  }
                </InfoValue>
              </InfoRow>
            </ProfessionalInfo>
          </CardContent>
        </ProfessionalCard>
      ))}
    </CardsContainer>
  );

  const renderTableView = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <TableHeader>שם</TableHeader>
            <TableHeader>אימייל</TableHeader>
            <TableHeader>מקצוע</TableHeader>
            <TableHeader>מספר רישיון</TableHeader>
            <TableHeader>תפוגת רישיון</TableHeader>
            <TableHeader>סטטוס</TableHeader>
            <TableHeader>פעולות</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredProfessionals.map((professional) => (
            <TableRow key={professional.id}>
              <TableCell><strong>{professional.name}</strong></TableCell>
              <TableCell>{professional.email}</TableCell>
              <TableCell>{professional.professional_type}</TableCell>
              <TableCell>{professional.license_number || 'לא זמין'}</TableCell>
              <TableCell>
                {professional.license_expiration_date 
                  ? new Date(professional.license_expiration_date).toLocaleDateString('he-IL') 
                  : 'לא זמין'
                }
              </TableCell>
              <TableCell>
                <TableStatusBadge status={professional.status}>
                  {professional.status}
                </TableStatusBadge>
              </TableCell>
              <TableCell>
                <ActionButton onClick={() => handleProfessionalClick(professional.id)}>
                  פרטים
                </ActionButton>
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
          <TopPanelLogo />
          <TopPanelTitleHolder>
            <TopPanelTitle>בעלי מקצוע</TopPanelTitle>
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
        <TopPanelLogo />
        <TopPanelTitleHolder>
          <TopPanelTitle>בעלי מקצוע</TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
        </TopPanelGroup>
      </TopPanel>
      <PageContent style={{ flexDirection: 'column' }}>
        {professionals.length === 0 ? (
          <EmptyStatePlaceholder msg='אין בעלי מקצוע זמינים' />
        ) : (
          <ContentContainer>
            {/* Header */}
            <ContentHeader>
              <HeaderLeft>
                <Title>בעלי מקצוע</Title>
                <Separator>•</Separator>
                <Badge>{filteredProfessionals.length}</Badge>
              </HeaderLeft>

              <HeaderRight>
                <AddButton onClick={() => setShowAdd(true)}>
                  <FaPlus />
                  הוסף בעל מקצוע
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
                  placeholder="חפש בעלי מקצוע..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchInputContainer>
            </SearchContainer>

            {/* Content */}
            {filteredProfessionals.length === 0 ? (
              <EmptyState>לא נמצאו בעלי מקצוע התואמים לחיפוש</EmptyState>
            ) : (
              viewMode === 'cards' ? renderCardView() : renderTableView()
            )}
          </ContentContainer>
        )}
      </PageContent>
      {showAdd && (
        <ProfessionalCreationDialog
          onClose={onProfessionalAdded}
          professionalTypes={types}
        />
      )}
    </FixedPageContainer>
  );
};

export default ProfessionalsView;

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

const ProfessionalCard = styled.div`
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

const CardContent = styled.div`
  margin-top: 2.5rem;
`;

const ProfessionalName = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #4b6b8e;
`;

const ProfessionalInfo = styled.div`
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
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  min-width: 600px;
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
  background: ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#e8f5e9' :
    status === ProfessionalStatus.WARNING ? '#fffbdd' :
    status === ProfessionalStatus.EXPIRED ? '#ffeef0' :
    '#ffeef0'};
  color: ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#2e7d32' :
    status === ProfessionalStatus.WARNING ? '#735c0f' :
    status === ProfessionalStatus.EXPIRED ? '#cb2431' :
    '#cb2431'};
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #4b6b8e;
  color: #4b6b8e;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4b6b8e;
    color: white;
  }
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
