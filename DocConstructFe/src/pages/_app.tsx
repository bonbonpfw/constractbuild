import React from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../styles/globalStyles';
import theme from '../styles/theme';
import Sidebar from '../components/Sidebar';
import styled from 'styled-components';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: row-reverse;
  position: fixed;
  top: 0;
  left: 0;
`;

const ContentContainer = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  transition: all 0.3s ease;
`;

const AppContent: React.FC<AppProps & { router: any }> = ({ Component, pageProps, router }) => {
  const {showSidebar, loading} = useAuth();

  if (loading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <AppContainer>
      {showSidebar && <Sidebar/>}
      <ContentContainer>
        <Component {...pageProps} />
      </ContentContainer>
    </AppContainer>
  );
};

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
