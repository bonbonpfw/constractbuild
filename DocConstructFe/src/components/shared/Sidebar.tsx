import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Link from "next/link";
import {
  FaBuilding,
  FaUserTie,
  FaBars,
  FaSignOutAlt,
  FaUsers,
  FaUser,
} from "react-icons/fa";
import Cookies from "js-cookie";

const SidebarContainer = styled.div<{ isCollapsed: boolean }>`
  width: ${(props) => (props.isCollapsed ? "60px" : "250px")};
  height: 100vh;
  background: #f5f5f5;
  color: #51789f;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  direction: rtl;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
`;

const SidebarGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const SidebarItemHolder = styled.div<{ isActive: boolean }>`
  cursor: ${(props) => (props.isActive ? "default" : "pointer")};
  height: 65px;
  display: flex;
  text-decoration: none;
  padding: 14px 0 14px 0;
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  transition: all 0.2s ease;

  &:hover,
  &:focus {
    background-color: rgb(227, 237, 246);
  }
`;

const SidebarItemLabel = styled.span<{
  isCollapsed: boolean;
  isActive: boolean;
}>`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  font-size: 22px;
  border-radius: ${(props) => props.theme.borderRadius.small};
  background-color: "transparent";
  visibility: ${(props) => (props.isCollapsed ? "hidden" : "visible")};
  transition:
    opacity 0.2s ease,
    visibility 0s linear ${(props) => (props.isCollapsed ? "0s" : "0.3s")};

  &:hover,
  &:focus {
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
  margin-right: 10px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #51789f;
  font-size: 28px;
  cursor: pointer;
  margin-bottom: 30px;
  transition: color 0.2s ease;
`;

const LogoutHolder = styled.div`
  border-top: 1px solid #e0e0e0;
  padding: 10px 0 20px 0;
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 20px;
`;

const UserManagementHolder = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
`;

const UserProfileSection = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 12px;
  transition: all 0.3s ease;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #51789f 0%, #3d5a7a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: ${(props) => (props.isCollapsed ? "0" : "1")};
  visibility: ${(props) => (props.isCollapsed ? "hidden" : "visible")};
  transition:
    opacity 0.2s ease,
    visibility 0s linear ${(props) => (props.isCollapsed ? "0s" : "0.3s")};
  overflow: hidden;
`;

const Username = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #7f8c8d;
  white-space: nowrap;
`;

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userInfo, setUserInfo] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored !== null) {
      setIsCollapsed(JSON.parse(stored));
    }

    // Load user info
    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (e) {
        console.error("Failed to parse user info:", e);
      }
    }
  }, []);

  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const routes = [
    { label: "פרויקטים", icon: <FaBuilding />, path: "/projects" },
    { label: "אנשי מקצוע", icon: <FaUserTie />, path: "/professionals" },
  ];

  const handleLogout = () => {
    Cookies.remove("auth_token");
    localStorage.removeItem("user_info");

    router.push("/login");
  };

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const getInitial = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      <SidebarGroup>
        <SidebarGroup>
          <ToggleButtonHolder>
            <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
              <FaBars />
            </ToggleButton>
          </ToggleButtonHolder>
        </SidebarGroup>


        <SidebarGroup>
          <div style={{ marginTop: "20px" }}>
            {routes.map((route, index) => (
              <Link key={index} href={route.path} passHref>
                <SidebarItemHolder isActive={isActive(route.path)}>
                  <SidebarItemIcon>{route.icon}</SidebarItemIcon>
                  <SidebarItemLabel
                    isCollapsed={isCollapsed}
                    isActive={isActive(route.path)}
                  >
                    {route.label}
                  </SidebarItemLabel>
                </SidebarItemHolder>
              </Link>
            ))}
          </div>
        </SidebarGroup>
      </SidebarGroup>
      <BottomWrapper>
        <UserManagementHolder>
          <Link href="/users" passHref>
            <SidebarItemHolder isActive={isActive("/users")}>
              <SidebarItemIcon>
                <FaUsers />
              </SidebarItemIcon>
              <SidebarItemLabel
                isCollapsed={isCollapsed}
                isActive={isActive("/users")}
              >
                ניהול משתמשים
              </SidebarItemLabel>
            </SidebarItemHolder>
          </Link>
        </UserManagementHolder>
        {/* User Profile Section */}
        {userInfo && (
          <UserProfileSection isCollapsed={isCollapsed}>
            <UserAvatar>
              {userInfo.username ? getInitial(userInfo.username) : <FaUser />}
            </UserAvatar>
            <UserInfo isCollapsed={isCollapsed}>
              <Username>{userInfo.username}</Username>
              <UserRole>משתמש</UserRole>
            </UserInfo>
          </UserProfileSection>
        )}


        <LogoutHolder>
          <SidebarItemHolder isActive={false} onClick={handleLogout}>
            <SidebarItemIcon>
              <FaSignOutAlt />
            </SidebarItemIcon>
            <SidebarItemLabel isCollapsed={isCollapsed} isActive={false}>
              יציאה
            </SidebarItemLabel>
          </SidebarItemHolder>
        </LogoutHolder>
      </BottomWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;
