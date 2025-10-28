import React from 'react';
import styled from 'styled-components';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (key: string) => void;
  sortable?: boolean;
}

const SortableHeader = styled.th<{ sortable?: boolean }>`
  text-align: right;
  padding: 12px;
  border-bottom: 1px solid #e1e4e8;
  color: #2d5a83;
  font-weight: 600;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.sortable ? '#f8f9fa' : 'transparent'};
  }

  &:active {
    background-color: ${props => props.sortable ? '#e9ecef' : 'transparent'};
  }
`;

const SortIcon = styled.span`
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  opacity: 0.7;
`;

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  children,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  sortable = true
}) => {
  const isActive = currentSortKey === sortKey;
  
  const getSortIcon = () => {
    if (!sortable) return null;
    
    if (isActive) {
      return currentSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  const handleClick = () => {
    if (sortable) {
      onSort(sortKey);
    }
  };

  return (
    <SortableHeader sortable={sortable} onClick={handleClick}>
      <SortIcon>
        {getSortIcon()}
      </SortIcon>
      {children}
    </SortableHeader>
  );
};

export default SortableTableHeader;
