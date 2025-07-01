import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }

  * {
    box-sizing: border-box;
  }

  /* Global scrollbar styles */
  * {
    scrollbar-width: thin;
    scrollbar-color: #e0e0e0 #fafafa;
  }
  *::-webkit-scrollbar {
    width: 6px;
    background: #fafafa;
  }
  *::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 6px;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #0A2540;  // Dark navy for headings
    font-weight: ${props => props.theme.fonts.weights.bold};
  }
`;

export default GlobalStyle;