import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { getProfessionals, getMunicipalities, getProjects } from '../api';
import { Professional, Municipality, Project } from '../types';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load all data in parallel
        const [professionalsData, municipalitiesData, projectsData] = await Promise.all([
          getProfessionals(),
          getMunicipalities(),
          getProjects()
        ]);
        
        setProfessionals(professionalsData);
        setMunicipalities(municipalitiesData);
        setProjects(projectsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [router]);
  
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Projects
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {projects.length}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/projects/create" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create new project<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Professionals
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {professionals.length}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/professionals/create" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register new professional<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Municipalities
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {municipalities.length}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/municipalities/create" className="font-medium text-indigo-600 hover:text-indigo-500">
              Add new municipality<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderRecentProjects = () => (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">
          Recent Projects
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Latest construction projects in the system
        </p>
      </div>
      
      {projects.length === 0 ? (
        <div className="px-4 py-5 sm:px-6 text-gray-500 text-center">
          No projects found. Create your first project to get started.
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {projects.slice(0, 5).map(project => (
              <li key={project.project_id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <Link href={`/projects/${project.project_id}`} className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-indigo-600">{project.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{project.address}</p>
                  </div>
                  <div className="ml-6 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {project.municipality?.name || 'Unknown Municipality'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {projects.length > 5 && (
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <Link href="/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all projects<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  const renderRecentProfessionals = () => (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">
          Recent Professionals
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Latest registered construction professionals
        </p>
      </div>
      
      {professionals.length === 0 ? (
        <div className="px-4 py-5 sm:px-6 text-gray-500 text-center">
          No professionals found. Register your first professional to get started.
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {professionals.slice(0, 5).map(professional => (
              <li key={professional.professional_id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <Link href={`/professionals/${professional.professional_id}`} className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-indigo-600">{professional.name}</h3>
                    {professional.license_number && (
                      <p className="mt-1 text-sm text-gray-500">License: {professional.license_number}</p>
                    )}
                  </div>
                  <div className="ml-6 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {professional.professional_type?.type_name || 'Unknown Type'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {professionals.length > 5 && (
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <Link href="/professionals" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all professionals<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  const renderMunicipalities = () => (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">
          Municipalities
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Participating municipalities in the system
        </p>
      </div>
      
      {municipalities.length === 0 ? (
        <div className="px-4 py-5 sm:px-6 text-gray-500 text-center">
          No municipalities found. Add your first municipality to get started.
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {municipalities.map(municipality => (
              <li key={municipality.municipality_id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <Link href={`/municipalities/${municipality.municipality_id}`} className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-indigo-600">{municipality.name}</h3>
                    {(municipality.state || municipality.county) && (
                      <p className="mt-1 text-sm text-gray-500">
                        {municipality.county && `${municipality.county} County`}
                        {municipality.county && municipality.state && ', '}
                        {municipality.state}
                      </p>
                    )}
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-md bg-red-50 p-4 max-w-lg w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Permit Management Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            {renderSummaryCards()}
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              {renderRecentProjects()}
              {renderMunicipalities()}
            </div>
            <div>
              {renderRecentProfessionals()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
