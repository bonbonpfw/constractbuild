import styled from 'styled-components';



export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const CreateButton = styled.button`
  background-color: rgb(80, 111, 145);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(49, 34, 34, 0.1);

  &:hover {
    background-color: rgb(60, 91, 125);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;