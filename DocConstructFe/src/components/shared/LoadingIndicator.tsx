import React from 'react';
import styled from 'styled-components';
import { FaBuilding, FaHardHat, FaHome, FaCity } from 'react-icons/fa';

interface LoadingContainerProps {
  fullHeight?: boolean;
}

const LoadingContainer = styled.div<LoadingContainerProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: ${props => props.fullHeight ? '60vh' : 'auto'};
  padding: ${props => props.fullHeight ? '0' : '30px 0'};
`;

interface IconContainerProps {
  theme: {
    colors: {
      primary: string;
    };
  };
}

const IconContainer = styled.div<IconContainerProps>`
  font-size: 3rem;
  color: ${props => props.theme.colors.primary};
  display: flex;
  position: relative;
  margin-bottom: 16px;
`;

const PrimaryIcon = styled.div`
  animation: pulse 1.5s infinite ease-in-out;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0.6;
      transform: scale(0.8);
    }
  }
`;

const SecondaryIcon = styled.div`
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 1.5rem;
  animation: float 3s infinite ease-in-out;
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

interface LoadingTextProps {
  theme: {
    colors: {
      text: string;
    };
  };
}

const LoadingText = styled.p<LoadingTextProps>`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.text};
  text-align: center;
  direction: rtl;
`;

interface LoadingIndicatorProps {
  text?: string;
  fullHeight?: boolean;
  type?: 'building' | 'home' | 'city' | 'construction';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  text = 'טוען נתונים...', 
  fullHeight = true,
  type = 'building'
}) => {
  const getIcons = () => {
    switch (type) {
      case 'home':
        return {
          primary: <FaHome />,
          secondary: <FaCity />
        };
      case 'city':
        return {
          primary: <FaCity />,
          secondary: <FaBuilding />
        };
      case 'construction':
        return {
          primary: <FaBuilding />,
          secondary: <FaHardHat />
        };
      case 'building':
      default:
        return {
          primary: <FaBuilding />,
          secondary: <FaHome />
        };
    }
  };

  const icons = getIcons();

  return (
    <LoadingContainer fullHeight={fullHeight}>
      <IconContainer>
        <PrimaryIcon>
          {icons.primary}
        </PrimaryIcon>
        <SecondaryIcon>
          {icons.secondary}
        </SecondaryIcon>
      </IconContainer>
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingIndicator; 