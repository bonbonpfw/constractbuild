import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
      lightGrey: string;
      button: {
        primary: string;
        createSurvey: string;
      };
    };
    fonts: {
      main: string;
      weights: {
        light: number;
        regular: number;
        medium: number;
        bold: number;
      };
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
    };
    gradients: {
      sidebar: string;
      background: string;
      button: string;
    };
    transitions: {
      default: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      pill: string;
    };
    buttons: {
      createSurvey: {
        backgroundColor: string;
        color: string;
        padding: string;
        borderRadius: string;
        fontWeight: number;
        fontSize: string;
        boxShadow: string;
        transition: string;
      };
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
  }
}