import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const CreateProjectPage: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Projects
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New Project
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Enter project details and assign professionals
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {/* Project create form will be implemented here */}
          <p className="text-center text-gray-500">Project creation form coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage; 