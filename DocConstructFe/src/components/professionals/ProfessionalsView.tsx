import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
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
  TopPanelTitleHolder, TableBody,
} from '../../styles/SharedStyles';
import ProfessionalCreationDialog from "./ProfessionalCreationDialog";
import {useRouter} from "next/router";
import EmptyStatePlaceholder from "../shared/EmptyState";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 16px;
  background: ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#e6ffed' :
    status === ProfessionalStatus.WARNING ? '#fffbdd' :
    status === ProfessionalStatus.EXPIRED ? '#ffeef0' :
    '#ffeef0'};
  color: ${({ status }) =>
    status === ProfessionalStatus.ACTIVE ? '#22863a' :
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
      <TableBody>
        <StatusBadge status={professional.status}>{professional.status}</StatusBadge>
      </TableBody>
      <TableBody>
        <Button onClick={() => onView()} variant="outlined">
          Details
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
      <PageContent>
        {professionals.length === 0 ? (
          <EmptyStatePlaceholder msg='No professionals available' />
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Occupation</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader />
              </tr>
            </thead>
            <tbody>
              {professionals.map(p => (
                <Row
                  key={p.id}
                  professional={p}
                  types={Types}
                />
              ))}
            </tbody>
          </Table>
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
