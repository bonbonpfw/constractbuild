import styled, { css } from 'styled-components';

export const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.accent};
  margin-top: 1rem;
  font-weight: 600;
`;

// Page Container
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  flex: 1;
  font-family: 'Inter', sans-serif;
  direction: rtl;
`;

export const TopPanel = styled.div`
  position: relative;                /* <-- make it the positioning context */
  border-bottom: 1px solid #dee2e6;
  display: flex;
  padding-bottom: 10px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  min-width: 800px;
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
  position: absolute;                /* <-- remove from normal flow */
  left: 50%;
  transform: translateX(-50%);       /* <-- truly center it */
`;

export const TopPanelTitle = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  text-align: center;
`;

export const TopPanelGroup = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: left;
  gap: 30px;
`;

export const PageContent = styled.div`
  overflow-y: auto;
  padding-top: 30px;
  display: flex;
  justify-content: flex-start;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// Buttons
export const Button = styled.button<{ variant?: 'contained' | 'outlined' | 'text' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  height: 35px;
  font-weight: 500;
  border-radius: ${p => p.theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* OUTLINED */
  ${p =>
    p.variant === 'outlined' &&
    css`
      background: transparent;
      border: 2px solid #99b1bd;
      color: #4b6370;

      &:hover:not(:disabled) {
        transform: scale(1.02);
        background: ${p.theme.colors.accent}33;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `}

  /* TEXT */
  ${p =>
    p.variant === 'text' &&
    css`
      background: transparent;
      border: none;
      color: ${p.theme.colors.accent};

      &:hover:not(:disabled) {
        background: ${p.theme.colors.accent}1A;
      }
    `}

  /* CONTAINED (default) */
  ${p =>
    (!p.variant || p.variant === 'contained') &&
    css`
      background: ${p.theme.colors.accent};
      border: none;
      color: #fff; /* white text on accent background */
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover:not(:disabled) {
        transform: scale(1.05);
        filter: brightness(0.9);
        box-shadow: 0 4px 8px #dddddd;
      }
    `}
`;

export const IconButton = styled.button<{ variant?: 'contained' | 'outlined' | 'text' }>`
  display: flex;
  align-items: center;
  justify-content: center;

  /* center horizontally */
  margin: 0 auto;

  /* make it a circle */
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 50%;

  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 1.125rem; /* ~18px */
  line-height: 1;

  /* default text color */
  color: ${p => p.theme.colors.accent};

  /* disabled */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* TEXT */
  ${p =>
    p.variant === 'text' &&
    css`
      background: transparent;
      border: none;

      &:hover:not(:disabled) {
        transform: scale(1.05);
        background: ${p.theme.colors.accent}1A; /* ~10% alpha */
      }
    `}

  /* OUTLINED */
  ${p =>
    p.variant === 'outlined' &&
    css`
      background: transparent;
      border: 2px solid ${p.theme.colors.accent};

      &:hover:not(:disabled) {
        transform: scale(1.05);
        background: ${p.theme.colors.accent}33; /* 20% alpha */
      }
    `}

  /* CONTAINED (default) */
  ${p =>
    (!p.variant || p.variant === 'contained') &&
    css`
      background: ${p.theme.colors.accent};
      border: none;
      color: #fff;

      &:hover:not(:disabled) {
        transform: scale(1.05);
        filter: brightness(0.9);
      }
    `}
`;

// Dialog
export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const DialogContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
`;

export const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

export const DialogTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #4b6b8e;
`;

export const DialogCloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #555;
  &:hover { color: #000; }
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  //overflow-x: hidden;  // common in many dialog styles */
`;

// Form

export const Form = styled.form`
  padding: 16px 24px;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FullWidthField = styled(Field)`
  grid-column: span 2;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #5e7c98;
  transition: color 0.15s ease-in-out;
`;

export const Input = styled.input`
  /* ---------- shared look ---------- */
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #dce3f1;
  color: #213953;
  transition: border-color 0.15s ease-in-out,
  color 0.15s ease-in-out,
  box-shadow 0.15s ease-in-out,
  background-color 0.15s ease-in-out;
  height: 36px;
  position: relative; /* anchor for absolute icon */

  /* ---------- date‑only tweaks ---------- */

  &[type='date'] {
    text-align: right; /* put the numbers on the right */
    padding-left: 38px; /* room for icon on the left */
    padding-right: 10px;

    /* move the native calendar indicator */

    &::-webkit-calendar-picker-indicator {
      position: absolute;
      left: 10px; /* push to the left edge */
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }

  &:focus {
    outline: none;
    border-color: #5a67d8;
    box-shadow: 0 0 0 2px rgba(90, 103, 216, 0.2);
  }

  &:focus:invalid {
    border-color: #c63f32;
    box-shadow: 0 0 0 2px rgba(197, 63, 50, 0.2);
  }
`;

export const Select = styled.select`
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #dce3f1;
  background: #ffffff;
  color: #213953;
  height: 36px;
  appearance: none;
  transition: border-color 0.15s ease-in-out,
              color 0.15s ease-in-out,
              box-shadow 0.15s ease-in-out,
              background-color 0.15s ease-in-out;

  &:hover:not(:disabled) {
    border-color: #b0bcd9;
  }

  &:focus {
    outline: none;
    border-color: #5a67d8;
    box-shadow: 0 0 0 2px rgba(90, 103, 216, 0.2);
  }

  &:invalid {
    border-color: #e53e3e;
  }

  /* ---------- keep look unchanged when disabled ---------- */
  &:disabled {
    border-color: #dce3f1;          /* same border */
    background: #ffffff;            /* same background */
    color: #213953;                 /* same font colour */
    -webkit-text-fill-color: #213953; /* Safari override */
    opacity: 1;                     /* cancel browser greying */
  }
`;

export const TextArea = styled.textarea`
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #dce3f1;
  color: #213953;
  font-family: sans-serif;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.15s ease-in-out,
              color 0.15s ease-in-out,
              box-shadow 0.15s ease-in-out,
              background-color 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #5a67d8;
    box-shadow: 0 0 0 2px rgba(90, 103, 216, 0.2);
  }
`;

// Empty State
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
  color: #d3dbe4;
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

// Table
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
`;

export const TableHeader = styled.th`
  text-align: right;
  padding: 12px;
  border-bottom: 1px solid #e1e4e8;
  color: #2d5a83;
`;

export const TableBody = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e1e4e8;
  vertical-align: middle;
  color: #4e778e;
`;

// Cards
export const Card = styled.div`
  background: white;
  border: 2px solid rgb(197, 214, 228);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  text-align: right;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const CardName = styled.h2`
  font-size: 22px;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 12px;
  font-weight: 500;
`;

export const CardInfo = styled.p`
  font-size: 16px;
  color: #4a4a4a;
  margin: 8px 0;
`;

export const CardGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;