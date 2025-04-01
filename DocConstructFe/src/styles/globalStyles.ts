import { createGlobalStyle } from 'styled-components';


const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: ${props => props.theme.fonts.main};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }

  * {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #0A2540;  // Dark navy for headings
    font-weight: ${props => props.theme.fonts.weights.bold};
  }
`;

export default GlobalStyle;