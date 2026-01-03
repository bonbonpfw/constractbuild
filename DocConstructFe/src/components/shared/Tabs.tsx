import styled, { css } from "styled-components";

const TabWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  background: transparent;
  border: none;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;

  ${({ isActive }) =>
    isActive &&
    css`
      color: #0071e3;
      border-bottom: 2px solid #0071e3;
    `}

  &:disabled {
    cursor: not-allowed;
    color: #ccc;
    opacity: 0.6;
  }
`;

export type Tab = {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #e0e0e0",
        marginBottom: 12,
        gap: "4px",
      }}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.value}
          isActive={activeTab === tab.value}
          onClick={() => onTabChange(tab.value)}
          disabled={tab.disabled}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {tab.icon}
            <span>{tab.label}</span>
          </div>
        </TabButton>
      ))}
    </div>
  );
}
