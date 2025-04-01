import React, { useState, useEffect } from 'react';
import ProfessionalManagement from '../../components/ProfessionalManagement';
import LoadingIndicator from '../../components/shared/LoadingIndicator';

const ProfessionalsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <LoadingIndicator text="טוען אנשי מקצוע..." type="building" />
      ) : (
        <ProfessionalManagement />
      )}
    </div>
  );
};

export default ProfessionalsPage; 