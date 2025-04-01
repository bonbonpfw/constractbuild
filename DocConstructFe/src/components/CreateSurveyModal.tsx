import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { addNewSurvey, getPanels } from '../api';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { errorHandler, ErrorResponseData } from "./ErrorHandler";

const ModalContainer = styled.div`
  position: fixed;
  left: 0;
  top: 100px;
  height: 100%;
  width: 400px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;

  &:hover {
    color: #007bff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background-color: white;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const FileInputButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;

  &:hover {
    background-color: #e0e0e0;
  }

  svg {
    margin-right: 10px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SubmitButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
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
    background-color: #0056b3;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Title = styled.h2`
  margin-bottom: 24px;
  text-align: center;
  font-size: 24px;
  font-weight: 500;
  color: #333;
`;

const CreateSurveyModal: React.FC<{
  onClose: () => void;
  onSurveyAdded: () => void;
}> = ({ onClose, onSurveyAdded }) => {
  const [surveyName, setSurveyName] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panel, setPanel] = useState('');
  const [panels, setPanels] = useState<string[]>([]);

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        console.log('Fetching panels...');
        const response = await getPanels();
        console.log('Panels API response:', response);
        
        if (response && response.data && Array.isArray(response.data.panels)) {
          console.log('Setting panels:', response.data.panels);
          setPanels(response.data.panels);
        } else {
          console.error('Invalid panels data format:', response.data);
          toast.error('מבנה נתוני הפאנלים לא תקין');
        }
      } catch (error) {
        console.error('Error fetching panels:', error);
        errorHandler(error as ErrorResponseData, 'טעינת הפאנלים נכשלה.');
      }
    };

    fetchPanels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyName || !date || !file) {
      toast.error("אנא ספק שם סקר, תאריך ובחר קובץ אקסל לפני הוספת הסקר.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('survey_name', surveyName);
    formData.append('survey_date', date);
    formData.append('survey_file', file);
    if (panel) {
      formData.append('panel', panel);
    }

    if (configFile) {
      const configText = await configFile.text();
      const configJson = JSON.parse(configText);
      formData.append('survey_config', JSON.stringify(configJson));
    }

    try {
      const response = await addNewSurvey(formData);
      if (response.data.message && response.data.survey_project_id) {
        toast.success('הסקר נוצר בהצלחה!');
        onSurveyAdded();
        onClose();
      }
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'הוספת הסקר נכשלה. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = surveyName && date && file;

  return (
    <>
      <ModalContainer>
        <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        <Title>יצירת סקר</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="שם הסקר"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            required
          />
          <Input
            type="date"
            placeholder="dd/mm/yyyy"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Select 
            value={panel}
            onChange={(e) => setPanel(e.target.value)}
          >
            <option value="" disabled selected>בחר פאנל</option>
            {panels.map((panelOption) => (
              <option key={panelOption} value={panelOption}>
                {panelOption}
              </option>
            ))}
          </Select>
          <FileInputButton as="label">
            <FaUpload />
            {file ? file.name : 'העלאת קובץ .xlsx'}
            <HiddenFileInput
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
            />
          </FileInputButton>
          <FileInputButton as="label">
            <FaUpload />
            {configFile ? configFile.name : 'העלאת קובץ תצורה'}
            <HiddenFileInput
              type="file"
              accept=".json"
              onChange={(e) => setConfigFile(e.target.files ? e.target.files[0] : null)}
            />
          </FileInputButton>

          <SubmitButton type="submit" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'טוען...' : 'צור סקר'}
          </SubmitButton>
        </Form>
      </ModalContainer>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default CreateSurveyModal;