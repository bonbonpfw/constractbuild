import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px 40px 0 40px;
  flex: 1;
  font-family: 'Inter', sans-serif;
  direction: rtl;
`;

export const TopPanel = styled.div`
  border-bottom: 1px solid #dee2e6;
  display: flex;
  padding-bottom: 10px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  img {
    object-fit: contain;
    width: 160px; // Reduced by 50%
    height: 80px; // Reduced by 50%
  }
`;

export const TopPanelLogo = styled.img.attrs({
  src: "/opa.png",
  alt: "OPA Logo"
})`
  width: 120px;
  height: 40px;
  object-fit: contain;
  margin-right: 24px;
`;

export const TopPanelTitleHolder = styled.div`
  width: 100%;
  justify-content: center;
  padding-left: 156px; // compensating logo size at right
`;

export const TopPanelTitle = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  text-align: center;
`;

export const TopPanelGroup = styled.div`
  width: 420px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row-reverse;
`;

export const TopPanelPanelButton = styled.button`
  ${props => props.theme.buttons.createSurvey}
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.gradients.button};
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  width: 200px;
  height: 40px;
  font-size: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.large};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.small};
  }

  svg {
    margin-right: 8px;
    transition: transform 0.5s ease;
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`;

export const PageContent = styled.div`
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const PageTitle = styled.h1`
  font-size: 36px;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 30px;
  font-weight: 600;
  text-align: right;
  margin-top: 40px;
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

export const AnalyticsContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: ${props => props.theme.shadows.small};
`;

export const DropdownContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: space-between;
  align-items: center;
`;

export const Select = styled.select`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.small};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  width: 100%;
  max-width: 300px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const ChartContainer = styled.div`
  height: 400px;
`;

export const LoadingSpinner = styled.div`
  border: 4px solid ${props => props.theme.colors.background};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.accent};
  margin-top: 1rem;
  font-weight: 600;
`;

export const ProgressOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ProgressContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  padding: 2rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: ${props => props.theme.shadows.large};
  text-align: center;
`;

export const ProgressText = styled.p`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

export const ChartTypeButton = styled(Button)`
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  background-color: ${props => props.theme.colors.primary};
  margin-right: auto;
  border-radius: 4px;
  min-width: 50px;

  &:hover {
    background-color: ${props => props.theme.colors.primary};
  }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.accent};
  font-size: 18px;

  &:hover {
    transform: scale(1.1);
    color: rgb(60, 91, 125);
  }
`;

export const DeleteIconButton = styled(IconButton)`
  color: rgb(188, 107, 49);

  &:hover {
    color: rgb(180, 0, 0);
  }
`;

export const OutlinedIconButton = styled.button`
  position: relative;
  background: none;
  border: 2px solid rgb(80, 111, 145);
  border-radius: 4px;
  cursor: pointer;
  padding: 8px 12px;
  margin-right: 12px;
  color: rgb(80, 111, 145);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: rgb(80, 111, 145);
    font-size: 16px;
  }

  &:hover {
    background: rgb(80, 111, 145);
    color: white;

    svg {
      color: white;
    }
  }

  &:hover::after {
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
  }
`;

export const Chip = styled.span`
  background-color: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.background};
  padding: 4px 8px 6px 8px;
  border-radius: 10px;
  font-size: 16px;
  margin: 2px;
  display: inline-block;
`;

export const Checkbox = styled.input.attrs({type: 'checkbox'})`
  margin-right: 10px;
  transform: scale(1.5) translateY(1px);
  accent-color: ${props => props.theme.colors.accent};
`;

export const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

// Styled Components for Dialog
export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 900;
`;

interface DialogContainerProps {
  width?: string;
}

export const DialogContainer = styled.div<DialogContainerProps>`
  width: ${props => props.width || '380px'};
  background-color: #fff;
  border-radius: 8px;
  padding: 10px 20px 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 901;
`;

export const DialogForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const DialogTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: rgb(80, 111, 145);
  text-align: center;
`;

export const DialogInput = styled.input`
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

interface DialogButtonProps {
  variant?: 'contained';
}

export const DialogButton = styled.button<DialogButtonProps>`
  background-color: ${props => props.variant === 'contained' ? 'rgb(80,111,145)' : props.theme.colors.secondary};
  color: ${props => props.variant === 'contained' ? "white" : props.theme.colors.primary};
  border: none;
  padding: 12px 24px;
  font-weight: 500;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  align-self: flex-end;
  margin-top: auto;

  &:hover {
    background-color: ${props => props.variant === 'contained' ? 'rgb(60,91,125)' : props.theme.colors.lightGrey};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const DialogButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

// Styled Components for List
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
`;

export const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 10px;
`;

export const ListItemText = styled.span`
  font-size: 16px;
`;

// Styled Components for Table
export const TableContainer = styled.div`
  min-width: 500px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

interface TableHeaderProps {
  clickable?: boolean;
  align?: string;
}

export const TableHeader = styled.th<TableHeaderProps>`
  background-color: ${(props) => props.theme.colors.accent};
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  > h1 {
    justify-content: ${(props) => props.align || 'center'};
    display: flex;
    font-size: 16px;
    font-weight: 600;
    color: white;

    > svg {
      margin-right: 3px;
    }
  }
`;

export const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
  text-align: ${(props) => props.align || 'center'};
`;

// Styled Components for Autocomplete
export const AutocompleteWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const AutocompleteInput = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: 10px;
  font-size: 1rem;
  border: 1px solid ${props => props.theme.colors.primary};

  &:focus {
    //outline: none;
    outline-color: ${props => props.theme.colors.accent};
      //border-color: ${props => props.theme.colors.accent};
  }
`;

export const AutocompleteList = styled.ul`
  position: absolute;
  top: 110%;
  left: 40px;
  right: 0; /* leave space for the + button */
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
`;

export const AutocompleteItem = styled.li`
  padding: 0.5rem;
  cursor: pointer;

  &:hover {
    background: #f2f2f2;
  }
`;

export const PlusButton = styled.button`
  margin-left: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

// Iframe
export const IframeContainer = styled.div`
  width: 1000px;
  height: 530px;
  position: relative;
  overflow: hidden;
`;

export const IframeOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 945px;
  height: 100%;
  background-color: transparent;
`;

// Custom Select
export const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
`;

export const SelectList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 150px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  z-index: 1000;
`;

export const SelectListItem = styled.li`
  padding: 0.5rem;
  cursor: pointer;

  &:hover {
    background: #e6e6e6; /* Custom hover background */
  }
`;

// Page content menu
export const TabNavHolder = styled.div`
  padding-top: 20px;
  display: flex;
  flex: 1;
  flex-direction: row;
`;

export const TabNavPanel = styled.div`
  width: 180px;
  background-color: white;
  padding: 20px 0 0 20px;
  height: 100%;
`;

interface TabNavButtonProps {
  active: boolean;
}

export const TabNavButton = styled.button<TabNavButtonProps>`
  display: block;
  width: 100%;
  padding: 12px 0 12px 12px;
  margin-bottom: 12px;
  text-align: right;
  background-color: transparent;
  color: ${props => (props.active ? 'rgb(80,111,145)' : '#333')};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.3s;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  font-size: 1.1rem;

  &:hover {
    color: rgb(80, 111, 145);
  }
`;

export const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: 'hidden';
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
`;

export const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  &::before {
    content: '';
    width: 32px;
    height: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
`;

export const EmptyStateText = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;
