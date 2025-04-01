import React from 'react';
import {
  IframeContainer,
  IframeOverlay,
  PageContainer,
  PageContent,
  TopPanel,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder
} from '../styles/SharedStyles';
import {useAuth} from "../context/AuthContext";


const SurveysOverTime: React.FC = () => {
  const biEmbeddedLink = "https://lookerstudio.google.com/embed/reporting/6c1d6a51-fefc-41d0-9e80-d4d36dee5391/page/qw8ME";
  const {roles} = useAuth();

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>
            מעקב שאלות לאורך זמן
          </TopPanelTitle>
        </TopPanelTitleHolder>
      </TopPanel>
      <PageContent>
        <IframeContainer>
          {!roles.includes('admin') &&
            <IframeOverlay/>
          }
          <iframe
            width="100%"
            height="100%"
            src={biEmbeddedLink}
            style={{border: 0}}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </IframeContainer>
      </PageContent>
    </PageContainer>
  );
};

export default SurveysOverTime;