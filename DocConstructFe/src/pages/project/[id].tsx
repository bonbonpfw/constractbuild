import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/router';
import {
  getSurveyById,
  storeOvertimeData,
  removeOvertimeData,
} from '../../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChartLine, faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import {
  PageContainer,
  LoadingSpinner,
  ErrorMessage,
  TopPanel,
  TopPanelLogo,
  PageContent,
  OutlinedIconButton,
  TabNavPanel,
  TabNavButton,
  TabContent,
  TabNavHolder,
} from '../../styles/SharedStyles';
import styled from 'styled-components';
import {FaTrash, FaUserFriends} from 'react-icons/fa';
import {errorHandler, ErrorResponseData} from '../../components/ErrorHandler';
import AccessDialog from '../../components/survey/SurveyAccessDialog';
import useDeleteSurvey from "../../components/survey/useDeleteSurvey";
import DeleteDialog from "../../components/survey/DeleteDialog";
import useSurveyAccess from "../../components/survey/useSurveyAccess";
import {SurveyData} from "../../types";

// Lazy load components to improve performance
const SurveyOverview = lazy(() => import('../../components/SurveyOverview'));
const SurveyAnalytics = lazy(() => import('../../components/SurveyAnalytics'));
const SurveyBI = lazy(() => import('../../components/SurveyBI'));
const Statistics = lazy(() => import('../../components/Statistics'));


const ContentArea = styled.div<{ isBiTab: boolean }>`
  flex: 1;
  padding: 0;
  overflow-y: ${props => (props.isBiTab ? 'hidden' : 'auto')};
`;

const SurveyName = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 24px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const defaultSurveyData: SurveyData = {
  id: '',
  survey_name: '',
  survey_date: '',
  survey_file_name: '',
  survey_report: null,
  num_of_responded: null,
  num_of_questions: null,
  access: [],
}

const SurveyDetailPage: React.FC = () => {
  const router = useRouter();
  const surveyId = typeof router.query.id === 'string' ? router.query.id : '';

  const [surveyData, setSurveyData] = useState<SurveyData>(defaultSurveyData);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'bi' | 'statistics'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [tabsVisited, setTabsVisited] = useState<Set<string>>(new Set(['overview']));

  const {isDeleteDialogOpen, handleDelete, handleConfirmDelete, handleCancelDelete} = useDeleteSurvey(surveyId);
  const {isEditor} = useSurveyAccess(surveyData);

  const fetchSurveyData = async () => {
    setIsLoading(true);
    try {
      const data = await getSurveyById(surveyId);
      setSurveyData(data);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'שגיאה בטעינת נתוני הסקר');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreOvertime = async () => {
    if (!surveyId) return;
    try {
      const response = await storeOvertimeData(surveyId);
      toast.success(response.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'שגיאה בהוספת נתונים לטרנד');
    }
  };

  const handleRemoveOvertime = async () => {
    if (!surveyId) return;
    try {
      await removeOvertimeData(surveyId);
      toast.success('הנתונים הוסרו בהצלחה מהטרנד', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'שגיאה בהסרת נתונים מהטרנד');
    }
  };

  useEffect(() => {
    if (!surveyId) return;
    fetchSurveyData();
  }, [surveyId]);

  const handleTabClick = (tab: 'overview' | 'analytics' | 'bi' | 'statistics') => {
    setActiveTab(tab);
    setTabsVisited(prev => new Set(prev).add(tab));
  };

  if (isLoading) return <LoadingSpinner />;
  if (!surveyData) return <ErrorMessage>No survey data available</ErrorMessage>;

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo />
        {isEditor && (
          <ButtonContainer>
            <OutlinedIconButton onClick={handleStoreOvertime} data-tooltip="הוסף לטרנד">
              <FontAwesomeIcon icon={faPlus}/>
              <FontAwesomeIcon icon={faChartLine}/>
              <span>הוסף לטרנד</span>
            </OutlinedIconButton>
            <OutlinedIconButton onClick={handleRemoveOvertime} data-tooltip="הסר מטרנד">
              <FontAwesomeIcon icon={faMinus}/>
              <FontAwesomeIcon icon={faChartLine}/>
              <span>הסר מטרנד</span>
            </OutlinedIconButton>
            <OutlinedIconButton onClick={() => setIsAccessDialogOpen(true)} title="לשתף גישה">
              <FaUserFriends/>
            </OutlinedIconButton>
            <OutlinedIconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title="מחק סקר"
            >
              <FaTrash/>
            </OutlinedIconButton>
          </ButtonContainer>
        )}
      </TopPanel>
      <PageContent>
        <TabNavHolder>
          <TabNavPanel>
            <SurveyName dir="rtl" style={{fontSize: '1.4rem'}}>
              {surveyData.survey_name || 'סקר ללא שם'}
            </SurveyName>
            <TabNavButton
              active={activeTab === 'overview'}
              onClick={() => handleTabClick('overview')}
              style={{ fontSize: '1.1rem' }}
            >
              מידע כללי
            </TabNavButton>
            <TabNavButton
              active={activeTab === 'analytics'}
              onClick={() => handleTabClick('analytics')}
              style={{ fontSize: '1.1rem' }}
            >
              ניתוח נתונים
            </TabNavButton>
            <TabNavButton
              active={activeTab === 'bi'}
              onClick={() => handleTabClick('bi')}
              style={{ fontSize: '1.1rem' }}
            >
              מצגת BI
            </TabNavButton>
            <TabNavButton
              active={activeTab === 'statistics'}
              onClick={() => handleTabClick('statistics')}
              style={{ fontSize: '1.1rem' }}
            >
              מובהקות סטטיסטית
            </TabNavButton>
          </TabNavPanel>
          <TabContent>
            <ContentArea isBiTab={activeTab === 'bi'}>
              <Suspense fallback={<LoadingSpinner />}>
                {activeTab === 'overview' && tabsVisited.has('overview') && (
                  <SurveyOverview surveyData={surveyData} fetchSurveyData={fetchSurveyData}/>
                )}
                {activeTab === 'analytics' && tabsVisited.has('analytics') && (
                  <SurveyAnalytics surveyData={surveyData} csvData={surveyData.csv_data || ''}/>
                )}
                {activeTab === 'bi' && tabsVisited.has('bi') && (
                  <SurveyBI surveyData={surveyData}/>
                )}
                {activeTab === 'statistics' && tabsVisited.has('statistics') && (
                  <Statistics surveyData={surveyData}/>
                )}
              </Suspense>
            </ContentArea>
          </TabContent>
        </TabNavHolder>
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
        {isAccessDialogOpen && (
          <AccessDialog
            fetchSurveyData={fetchSurveyData}
            surveyData={surveyData}
            onClose={() => setIsAccessDialogOpen(false)}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default SurveyDetailPage;
