import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/projects');
  }, []);
  return <div />;
};

export default IndexPage;
