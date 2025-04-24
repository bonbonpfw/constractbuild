import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FaBuilding, 
  FaUserTie,
  FaBars
} from 'react-icons/fa';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const Sidebar = styled.div<{ isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '60px' : '250px'};
  background: ${props => props.theme.gradients.sidebar};
  border-right: 1px solid ${props => props.theme.colors.lightGrey};
  padding: 30px 0;
  direction: rtl;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.3s ease;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 10px 40px 0;
`;

const MenuItemText = styled.span<{ isCollapsed: boolean }>`
  margin-right: 10px;
  visibility: ${props => props.isCollapsed ? 'hidden' : 'visible'};
  opacity: ${props => props.isCollapsed ? 0 : 1};
  transition: opacity 0.2s ease, visibility 0s linear ${props => props.isCollapsed ? '0.2s' : '0s'};
  white-space: nowrap;
`;

const MenuItem = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 12px 20px;
  direction: rtl;
  border-radius: 5px 0 0 5px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  color: ${props => props.theme.colors.text};

  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }

  svg {
    margin-left: 10px;
    font-size: 20px;
    color: ${props => props.theme.colors.primary};
  }
`;

const ActiveMenuItem = styled(MenuItem)<{ isCollapsed: boolean }>`
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${props => props.isCollapsed ? '0' : '5px'};
    background-color: ${props => props.theme.colors.primary};
  }
`;

const ToggleButtonHolder = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 15px 20px 0;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.accent};
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ href, icon, text, isActive, isCollapsed }) => {
  const ItemComponent = isActive ? ActiveMenuItem : MenuItem;
  
  return (
    <Link href={href} passHref>
      <ItemComponent isCollapsed={isCollapsed}>
        {icon}
        <MenuItemText isCollapsed={isCollapsed}>{text}</MenuItemText>
      </ItemComponent>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  
  const router = useRouter();
  const currentPath = router.pathname;

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <LayoutContainer>
      <Sidebar isCollapsed={isCollapsed}>
        <div>
          <ToggleButtonHolder>
            <ToggleButton onClick={toggleSidebar}>
              <FaBars />
            </ToggleButton>
          </ToggleButtonHolder>
          <SidebarNav>
            <MenuItemComponent 
              href="/projects" 
              icon={<FaBuilding />}
              text="פרויקטים"
              isActive={currentPath.startsWith('/projects')}
              isCollapsed={isCollapsed}
            />
            <MenuItemComponent 
              href="/professionals" 
              icon={<FaUserTie />}
              text="אנשי מקצוע"
              isActive={currentPath.startsWith('/professionals')}
              isCollapsed={isCollapsed}
            />
          </SidebarNav>
        </div>
      </Sidebar>
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 
