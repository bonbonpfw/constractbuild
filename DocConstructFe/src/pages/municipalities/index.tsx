import React, { useState, useEffect } from 'react';
import MunicipalityManagement from '../../components/MunicipalityManagement';
import LoadingIndicator from '../../components/shared/LoadingIndicator';

const MunicipalitiesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

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
        <LoadingIndicator text="טוען רשויות..." type="home" />
      ) : (
        <MunicipalityManagement />
      )}
    </div>
  );
};

export default MunicipalitiesPage; 