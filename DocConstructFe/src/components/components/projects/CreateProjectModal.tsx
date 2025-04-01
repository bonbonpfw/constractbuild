import React, { useState, useEffect } from 'react';
import { createProject, get_all_projects } from '../../api';
import {
  DialogOverlay,
  DialogContainer,
  DialogTitle,
  DialogForm,
  DialogInput,
  DialogButton,
  DialogButtonGroup,
  Select
} from '../../styles/SharedStyles';
import { Municipality } from '../../types';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectAdded: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [municipalityId, setMunicipalityId] = useState<number | ''>('');
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_all_projects();
        // Extract unique municipalities from projects data
        const uniqueMunicipalities = data.reduce((acc: Municipality[], project: any) => {
          if (project.municipality && !acc.some(m => m.municipality_id === project.municipality.municipality_id)) {
            acc.push(project.municipality);
          }
          return acc;
        }, []);
        setMunicipalities(uniqueMunicipalities);
      } catch (err) {
        setError('לא ניתן לטעון רשויות');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !address || !municipalityId) {
      setError('יש למלא את כל השדות החובה');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createProject({
        name,
        description,
        address,
        municipality_id: Number(municipalityId),
        status: 'draft'
      });
      
      onProjectAdded();
    } catch (err) {
      setError('שגיאה ביצירת הפרויקט');
      setIsLoading(false);
    }
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()} width="500px">
        <DialogTitle>יצירת פרויקט חדש</DialogTitle>
        <DialogForm onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">שם הפרויקט *</label>
            <DialogInput
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="שם הפרויקט"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description">תיאור</label>
            <DialogInput
              id="description"
              as="textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="תיאור הפרויקט"
              style={{ height: '80px' }}
            />
          </div>
          
          <div>
            <label htmlFor="address">כתובת *</label>
            <DialogInput
              id="address"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="כתובת"
              required
            />
          </div>
          
          <div>
            <label htmlFor="municipality">רשות *</label>
            <Select
              id="municipality"
              value={municipalityId}
              onChange={e => setMunicipalityId(Number(e.target.value))}
              required
            >
              <option value="">בחר רשות</option>
              {municipalities.map(municipality => (
                <option key={municipality.municipality_id} value={municipality.municipality_id}>
                  {municipality.name}
                </option>
              ))}
            </Select>
          </div>
          
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <DialogButtonGroup>
            <DialogButton type="button" onClick={onClose}>
              ביטול
            </DialogButton>
            <DialogButton type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'מעבד...' : 'צור פרויקט'}
            </DialogButton>
          </DialogButtonGroup>
        </DialogForm>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default CreateProjectModal; 