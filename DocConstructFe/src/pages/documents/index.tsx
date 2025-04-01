import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaFileAlt, FaPlus } from 'react-icons/fa';
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
`;

const EmptyStateIcon = styled(FaFileAlt)`
  font-size: 64px;
  color: #ccc;
  margin-bottom: 24px;
`;

const EmptyStateText = styled.p`
  font-size: 24px;
  color: #666;
  margin-bottom: 24px;
`;

const DocumentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would fetch document data
    const timer = setTimeout(() => {
      setLoading(false);
      setDocuments([]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelGroup>
          <TopPanelPanelButton onClick={() => {}}>
            צור מסמך חדש
            <FaPlus/>
          </TopPanelPanelButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent>
        <PageTitle>מסמכים</PageTitle>
        {loading ? (
          <LoadingIndicator text="טוען מסמכים..." type="city" />
        ) : documents.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon/>
            <EmptyStateText>אין מסמכים זמינים</EmptyStateText>
          </EmptyState>
        ) : (
          <div>
            {/* Document list would go here in a real implementation */}
            <p style={{ textAlign: 'center' }}>רשימת המסמכים תופיע כאן</p>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DocumentsPage; 