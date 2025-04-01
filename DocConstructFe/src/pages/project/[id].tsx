import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { getProjectById } from '../../api';
import { Project } from '../../types';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProjectHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProjectTitle = styled.h1`
  font-size: 28px;
  color: #0A2540;
  margin-bottom: 16px;
`;

const ProjectInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #0A2540;
  font-weight: 500;
`;

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      const response = await getProjectById(id as string);
      setProject(response);
      setLoading(false);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project details');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <PageContainer>
      <ProjectHeader>
        <ProjectTitle>{project.project_name}</ProjectTitle>
        <ProjectInfo>
          <InfoItem>
            <InfoLabel>Case ID</InfoLabel>
            <InfoValue>{project.project_case_id}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Status</InfoLabel>
            <InfoValue>{project.project_status}</InfoValue>
          </InfoItem>
        </ProjectInfo>
      </ProjectHeader>

      {/* Add more project details sections here as needed */}
    </PageContainer>
  );
};

export default ProjectDetailPage; 