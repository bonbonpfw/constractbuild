import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: 'rgb(80,111,145)',  
    secondary: '#F5F7FA', 
    accent: 'rgb(80,111,145)',  // This is where the green color is coming from
    text: '#333333', 
    background: '#FFFFFF', 
    lightGrey: '#E1E5EA',
    button: {
      primary: '#1A73E8',
      createSurvey: '#1A73E8',
    },
  },
  fonts: {
    main: "'Inter', 'Assistant', Arial, sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    }
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  gradients: {
    sidebar: 'linear-gradient(to bottom, #FFFFFF, #F5F7FA)',
    background: 'linear-gradient(to bottom right, #F5F7FA, #EBEFF4)',
    button: 'linear-gradient(45deg, rgb(80,111,145), #0056B3)',
  },
  transitions: {
    default: 'all 0.3s ease',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    pill: '50px',  // Added pill shape for buttons
  },
  buttons: {
    createSurvey: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '50px',  // Pill shape
      fontWeight: 600,
      fontSize: '18px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
};

export default theme;