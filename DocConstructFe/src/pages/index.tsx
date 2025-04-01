import React, {useEffect} from 'react';
import {TopPanel, PageContainer, TopPanelLogo} from '../styles/SharedStyles';
import {useRouter} from "next/router";


const Home: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/'); // TODO: remove this
  }, []);
  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
      </TopPanel>
    </PageContainer>
  );
};

export default Home;
