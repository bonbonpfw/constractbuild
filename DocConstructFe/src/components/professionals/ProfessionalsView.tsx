import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTh, FaList } from 'react-icons/fa';
import {
  getProfessionals, getProfessionalStatuses,
  getProfessionalTypes,
} from '../../api';
import { Professional, ProfessionalType, ProfessionalStatus } from '../../types';
import {
  Button,
  IconButton,
  PageContainer,
  PageContent,
  TableHeader,
  Table,
  TopPanel,
  TopPanelGroup,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder, 
  TableBody,
  CardGrid,
  Card,
  CardName,
  CardInfo,
} from '../../styles/SharedStyles';
import ProfessionalCreationDialog from "./ProfessionalCreationDialog";
import {useRouter} from "next/router";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import SortableTableHeader from "../shared/SortableTableHeader";
import useSort from "../../hooks/useSort";

type ViewMode = 'cards' | 'table';

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 16px;
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

const CardStatusBadge = styled.div<{ status: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 14px;
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

const Row: React.FC<{
  professional: Professional;
  types: string[];
}> = ({ professional, types }) => {
  const { push } = useRouter();
  const onView = () => {
    push(`/professionals/${professional.id}`);
  }
  return (
    <tr>
      <TableBody>{professional.name}</TableBody>
      <TableBody>{professional.email}</TableBody>
      <TableBody>{professional.professional_type}</TableBody>
      <TableBody>{professional.license_expiration_date ? new Date(professional.license_expiration_date).toLocaleDateString('he-IL') : 'לא זמין'}</TableBody>
      <TableBody>
        <StatusBadge status={professional.status}>{professional.status}</StatusBadge>
      </TableBody>
      <TableBody>
        <Button onClick={() => onView()} variant="outlined">
          פרטים
        </Button>
      </TableBody>
    </tr>
  );
};

const ProfessionalsView: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [Types, setTypes] = useState<string[]>([]);
  const [Statuses, setStatuses] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const { push } = useRouter();
  
  // Sorting functionality
  const { sortKey, sortDirection, handleSort, sortData } = useSort('name');

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const [professionalsData, types, statuses] = await Promise.all([
        getProfessionals(),
        getProfessionalTypes(),
        getProfessionalStatuses()
      ]);
      setProfessionals(professionalsData);
      setTypes(types);
      setStatuses(statuses);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to load professionals');
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
    <CardGrid>
      {professionals.map((professional) => (
        <Card
          key={professional.id}
          onClick={() => handleProfessionalClick(professional.id)}
        >
          <CardStatusBadge status={professional.status}>
            {professional.status}
          </CardStatusBadge>
          <CardName><b>{professional.name}</b></CardName>
          <CardInfo><b>אימייל:</b> {professional.email}</CardInfo>
          <CardInfo><b>מקצוע:</b> {professional.professional_type}</CardInfo>
          <CardInfo><b>טלפון:</b> {professional.phone || 'לא זמין'}</CardInfo>
          <CardInfo><b>תפוגת רישיון:</b> {professional.license_expiration_date ? new Date(professional.license_expiration_date).toLocaleDateString('he-IL') : 'לא זמין'}</CardInfo>
        </Card>
      ))}
    </CardGrid>
  );

  const renderTableView = () => {
    // Sort professionals based on current sort settings
    const sortedProfessionals = sortData(professionals, (professional, key) => {
      switch (key) {
        case 'name':
          return professional.name;
        case 'email':
          return professional.email;
        case 'professional_type':
          return professional.professional_type;
        case 'license_expiration_date':
          return professional.license_expiration_date ? new Date(professional.license_expiration_date) : null;
        case 'status':
          return professional.status;
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
              שם
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="email"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              אימייל
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="professional_type"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              מקצוע
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="license_expiration_date"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              תפוגת רישיון
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
              sortKey="actions"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              sortable={false}
            >
              {/* Actions column - not sortable */}
            </SortableTableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedProfessionals.map(p => (
            <Row
              key={p.id}
              professional={p}
              types={Types}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo />
        <TopPanelTitleHolder>
          <TopPanelTitle>בעלי מקצוע</TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
          <IconButton onClick={() => setShowAdd(true)}><FaPlus /></IconButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent style={{ flexDirection: 'column' }}>
        {professionals.length === 0 ? (
          <EmptyStatePlaceholder msg='No professionals available' />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#4b6b8e' }}>בעלי מקצוע ({professionals.length})</h2>
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
      </PageContent>
      {showAdd && (
        <ProfessionalCreationDialog
          onClose={onProfessionalAdded}
          professionalTypes={Types}
        />
      )}
    </PageContainer>
  );
};

export default ProfessionalsView;
