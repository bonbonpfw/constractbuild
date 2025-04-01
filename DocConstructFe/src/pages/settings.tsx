import React, {useState} from 'react';
import {useRouter} from "next/router";
import UserManagement from "../components/userManagement/UserManagement";
import {
  PageContainer,
  TabContent,
  TabNavButton,
  TabNavHolder,
  TabNavPanel,
  TopPanel,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder
} from "../styles/SharedStyles";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'UserManagement'>('UserManagement');
  const handleTabClick = (tab: 'UserManagement') => {
    setActiveTab(tab);
  };
  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>
            הגדרות
          </TopPanelTitle>
        </TopPanelTitleHolder>
      </TopPanel>
      <TabNavHolder>
        <TabNavPanel>
          <TabNavButton
            active={activeTab === 'UserManagement'}
            onClick={() => handleTabClick('UserManagement')}
            style={{fontSize: '1.1rem'}}
          >
            Users
          </TabNavButton>
        </TabNavPanel>
        <TabContent>
          {activeTab === 'UserManagement' && <UserManagement/>}
        </TabContent>
      </TabNavHolder>
    </PageContainer>
  );
};

export default SettingsPage;