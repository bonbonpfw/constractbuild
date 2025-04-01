import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {FaClipboardList, FaChartLine, FaBars, FaSearch} from 'react-icons/fa';
import Link from 'next/link';
import {IoSettingsSharp} from "react-icons/io5";

const SidebarContainer = styled.div<{ isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '60px' : '250px'};
  height: 100vh;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  direction: rtl;
  flex-shrink: 0;
`;

const SidebarGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const SidebarItemHolder = styled.div<{ isActive: boolean }>`
  cursor: ${props => props.isActive ? 'default' : 'pointer'};
  height: 65px;
  display: flex;
  color: #ffffff;
  text-decoration: none;
  padding: 14px 0 14px 0;
  font-weight: ${props => props.isActive ? '600' : '400'};
  background-color: ${props => props.isActive ? 'rgba(52, 152, 219, 0.2)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover, &:focus {
    background-color: rgba(52, 152, 219, 0.2);
  }
`;

const SidebarItemLabel = styled.span<{ isCollapsed: boolean; isActive: boolean }>`
  display: flex;
  align-items: center;
  color: #ffffff;
  text-decoration: none;
  font-weight: ${props => props.isActive ? '600' : '400'};
  font-size: 22px;
  border-radius: ${props => props.theme.borderRadius.small};
  background-color: 'transparent';
  visibility: ${props => (props.isCollapsed ? 'hidden' : 'visible')};
  transition: opacity 0.2s ease, visibility 0s linear ${props => (props.isCollapsed ? '0s' : '0.3s')};

  &:hover, &:focus {
    background-color: transparent;
  }
`;

const SidebarItemIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 15px;
  margin-right: 15px;
  font-size: 28px;
`;

const ToggleButtonHolder = styled.div`
  align-items: center;
  justify-content: right;
  display: flex;
  margin-top: 20px;
  margin-bottom: 10px;
  margin-right: 10px
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #bdc3c7;
  font-size: 28px;
  cursor: pointer;
  margin-bottom: 30px;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored ? JSON.parse(stored) : true;
  });
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const routes = [
    {'label': 'Projects', 'icon': <FaClipboardList/>, 'path': '/projects'},
    {'label': 'Professionals', 'icon': <FaChartLine/>, 'path': '/professionals'},
    {'label': 'Municipalities', 'icon': <FaSearch/>, 'path': '/municipalities'},
    {'label': 'Settings', 'icon': <IoSettingsSharp/>, 'path': '/settings'},
  ]

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      <SidebarGroup>
        <SidebarGroup>
          <ToggleButtonHolder>
            <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
              <FaBars/>
            </ToggleButton>
          </ToggleButtonHolder>
        </SidebarGroup>
        <SidebarGroup>
          <div style={{marginTop: '70px'}}>
            {routes.map((route, index) => (
              <Link key={index} href={route.path} passHref>
                <SidebarItemHolder isActive={isActive(route.path)}>
                  <SidebarItemIcon>
                    {route.icon}
                  </SidebarItemIcon>
                  <SidebarItemLabel isCollapsed={isCollapsed} isActive={isActive(route.path)}>
                    {route.label}
                  </SidebarItemLabel>
                </SidebarItemHolder>
              </Link>
            ))}
          </div>
        </SidebarGroup>
      </SidebarGroup>
    </SidebarContainer>
  );
};

export default Sidebar;
