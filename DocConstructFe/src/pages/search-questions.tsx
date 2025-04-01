import React, {useState, useEffect} from 'react';
import { searchQuestions, searchSegments } from '../api';
import { Input, Spin, Tag, Empty, Pagination, Collapse } from 'antd';
import { SearchOutlined, CalendarOutlined, ClearOutlined, FilterOutlined, AppstoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getScoreColor } from '../utils/scoreUtils';
import {
  PageContainer,
  TopPanel,
  TopPanelLogo,
  TopPanelTitle,
} from '../styles/SharedStyles';
import styled from 'styled-components';

const PageWrapper = styled.div`
  transition: padding-right 0.3s ease;
  min-height: 100vh;
  box-sizing: border-box;
`;

const DashboardLayout = styled.div`
  display: flex;
  height: 100vh;
  background-color: white;
  flex-direction: column;
  padding: 0 20px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 40px;
  padding: 20px;
`;

const SidePanel = styled.div`
  width: 180px;
  background-color: white;
  padding: 20px 0;
  height: 100%;
`;

const MainContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const SearchSection = styled.div`
  width: 100%;
  max-width: 900px;
  margin-bottom: 20px;
  direction: rtl;
`;

const TabButton = styled.button<{ active: boolean }>`
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  text-align: right;
  background-color: transparent;
  color: ${props => props.active ? 'rgb(80,111,145)' : '#333'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.3s;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  font-size: 1.1rem;

  &:hover {
    color: rgb(80,111,145);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebebeb;
`;

const FilterChip = styled(Tag)`
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  background-color: #f1f3f4;
  border: none;
  color: #3c4043;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    background-color: #e8eaed;
  }
  
  &.active {
    background-color: #e8f0fe;
    color: #1a73e8;
  }
`;

const ThresholdChip = styled(FilterChip)`
  &.selected {
    background-color: #e8f0fe;
    color: #1a73e8;
    font-weight: 500;
  }
`;

const ResultsContainer = styled.div`
  padding: 0;
`;

const ScoreCircle = styled.span<{ borderColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.borderColor};
  margin-right: 8px;
  font-size: 12px;
  font-weight: bold;
  background-color: white;
`;

const ResultItem = styled.div`
  margin-bottom: 28px;
  max-width: 700px;
  
  .survey-header {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }
  
  .result-url {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: #3c4043;
    margin-top: 8px;
  }
  
  .result-title {
    font-size: 18px;
    line-height: 1.3;
    font-weight: 400;
    color: rgb(26, 13, 171);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .result-content {
    font-size: 14px;
    line-height: 1.58;
    color: #3c4043;
    margin-top: 3px;
  }
  
  .result-metadata {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    font-size: 12px;
    color: #70757a;
  }

  .segment-tag {
    display: inline-flex;
    align-items: center;
    background-color: #f1f3f4;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    color: #5f6368;
    margin-right: 4px;
    
    &:hover {
      background-color: #e8eaed;
    }
  }
  
  .panel-tag {
    display: inline-flex;
    align-items: center;
    background-color: #e8f0fe;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    color: #1a73e8;
    margin-right: 4px;
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 30px;
  text-align: center;

  .ant-pagination-item-active {
    border-color: #1a73e8;
    
    a {
      color: #1a73e8;
    }
  }
  
  .ant-pagination {
    display: flex;
    justify-content: center;
  }
`;

const NoResults = styled(Empty)`
  margin-top: 40px;
  
  .ant-empty-description {
    font-size: 16px;
    color: #5f6368;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .ant-spin {
    .ant-spin-dot-item {
      background-color: #4285f4;
    }
  }
`;

const StyledTopPanel = styled(TopPanel)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
  position: relative;
`;

const LogoWrapper = styled.div`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
`;

const SearchBox = styled.div`
  display: flex;
  width: 100%;
  max-width: 632px;
  margin: 0 0 24px;
  position: relative;
  
  .ant-input {
    height: 44px;
    border-radius: 24px;
    padding: 0 16px;
    box-shadow: 0 1px 6px rgba(32,33,36,0.28);
    border: 1px solid transparent;
    direction: rtl;
    width: 100%;
    padding-right: 40px;
    padding-left: 40px;
    
    &:hover, &:focus {
      border-color: rgba(223,225,229,0);
      box-shadow: 0 1px 6px rgba(32,33,36,0.28);
    }
    
    font-size: 16px;
    text-align: right;
    
    &::placeholder {
      color: #9aa0a6;
      text-align: right;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9aa0a6;
    font-size: 20px;
    z-index: 10;
    cursor: pointer;
  }
  
  .clear-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #70757a;
    font-size: 18px;
    z-index: 10;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    
    &:hover {
      background-color: rgba(95, 99, 104, 0.1);
    }
  }
`;

// Add styled component for Collapse
const StyledCollapse = styled(Collapse)`
  direction: rtl;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  
  .ant-collapse-item {
    margin-bottom: 8px;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
  }
  
  .ant-collapse-header {
    font-size: 16px;
    font-weight: 500;
    color: #1a0dab;
  }
  
  .ant-collapse-content {
    background-color: #fafafa;
  }
`;

const SurveyItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .survey-title {
    color: rgb(80,111,145);
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    display: block;
    margin-bottom: 4px;
  }
  
  .survey-date {
    color: #666;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

interface SearchResult {
  surveyName: string;
  surveyId: string;
  surveyDate: string;
  question: string;
  segments: string[];
  panel: string;
  survey_score: number;
}

interface SurveyInfo {
  surveyId: string;
  surveyName: string;
  surveyDate: string;
}

interface SegmentResult {
  segmentName: string;
  surveyCount: number;
  surveys: SurveyInfo[];
}

const THRESHOLD_OPTIONS = [
  { value: 1.0, label: '100%' },
  { value: 0.8, label: '80%' },
  { value: 0.6, label: '60%' },
  { value: 0.2, label: '20%' }
];

type ActiveView = 'questions' | 'segments';

// Add a function to highlight matching words in the search results
const highlightMatches = (text: string, query: string): string => {
  if (!query.trim() || !text) return text;
  
  // Split the query into words and filter out empty strings
  const queryWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  // Create a regex pattern that matches any of the query words (case insensitive)
  const pattern = new RegExp(`(${queryWords.join('|')})`, 'gi');
  
  // Replace matches with a highlighted version
  return text.replace(pattern, '<span style="background-color: #FFFF00;">$1</span>');
};

const SearchQuestionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('questions');
  const [segments, setSegments] = useState<SegmentResult[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [selectedPanel, setSelectedPanel] = useState<string>('');
  const [threshold, setThreshold] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [allSegments, setAllSegments] = useState<string[]>([]);
  
  // Extract unique segments and panels from results
  const uniqueSegments = Array.from(new Set(results.flatMap(result => result.segments))).filter(Boolean);
  const uniquePanels = Array.from(new Set(results.map(result => result.panel))).filter(Boolean);
  
  // Get all available segments for the segment filter tab
  useEffect(() => {
    if (activeView === 'segments') {
      fetchAllSegments();
    }
  }, [activeView]);
  
  const fetchAllSegments = async () => {
    try {
      setLoadingSegments(true);
      const response = await searchSegments();
      setSegments(response);
      
      // Extract unique segment names from segment search results
      const segmentNames: string[] = Array.from(
        new Set(response.map((segment: SegmentResult) => segment.segmentName))
      ).filter(Boolean) as string[];
      
      setAllSegments(segmentNames);
      setLoadingSegments(false);
    } catch (error) {
      console.error('Error fetching segments:', error);
      setLoadingSegments(false);
    }
  };
  
  const handleSegmentFilterSelect = async (segment: string) => {
    if (!segment) return;
    
    setLoading(true);
    setSelectedSegment(segment);
    
    try {
      const response = await searchQuestions(`segment:${segment}`, 1.0);
      
      if (response && response.length > 0) {
        const formattedResults = response.map((item: any) => ({
          surveyName: item.survey_name || 'N/A',
          surveyId: item.survey_id || '',
          surveyDate: item.survey_date || null,
          question: item.question || '',
          segments: item.segments || [],
          panel: item.panel || '',
          survey_score: item.survey_score || 0
        }));
        
        setResults(formattedResults);
        setFilteredResults(formattedResults);
      } else {
        setResults([]);
        setFilteredResults([]);
      }
    } catch (error) {
      console.error('Error searching by segment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter results when filters change
  useEffect(() => {
    if (results.length > 0) {
      let filtered = [...results];
      
      if (selectedSegment) {
        filtered = filtered.filter(result => 
          result.segments.includes(selectedSegment)
        );
      }
      
      if (selectedPanel) {
        filtered = filtered.filter(result => 
          result.panel === selectedPanel
        );
      }
      
      setFilteredResults(filtered);
      setCurrentPage(1);
    }
  }, [results, selectedSegment, selectedPanel]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setFilteredResults([]);
    setSelectedSegment('');
    setSelectedPanel('');

    try {
      const response = await searchQuestions(searchQuery.trim(), threshold);

      if (response && response.length > 0) {
        const formattedResults = response.map((item: any) => ({
          surveyName: item.survey_name || 'N/A',
          surveyId: item.survey_id || '',
          surveyDate: item.survey_date || null,
          question: item.question || '',
          segments: item.segments || [],
          panel: item.panel || '',
          survey_score: item.survey_score || 0
        }));

        setResults(formattedResults);
        setFilteredResults(formattedResults);
      } else {
        setResults([]);
        setFilteredResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('אירעה שגיאה בחיפוש. אנא נסה/י שוב או נסח/י את השאלה מחדש');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setFilteredResults([]);
    setError(null);
  };

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    setResults([]);
    setFilteredResults([]);
    setSearchQuery('');
    setError(null);
    
    if (view === 'segments') {
      fetchAllSegments();
    }
  };
  
  const toggleSegmentFilter = (segment: string) => {
    setSelectedSegment(selectedSegment === segment ? '' : segment);
  };
  
  const togglePanelFilter = (panel: string) => {
    setSelectedPanel(selectedPanel === panel ? '' : panel);
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return 'לא זמין'; // Return "Not available" in Hebrew instead of empty string
    try {
      // Attempt to parse the date - check if it's in format DD/MM/YYYY first
      let dateObj;
      if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        dateObj = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'לא זמין';
      }
      
      return dateObj.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date format error:', e, date);
      return 'לא זמין';
    }
  };
  
  // Calculate pagination
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <PageWrapper>
      <PageContainer>
        <StyledTopPanel>
          <LogoWrapper>
            <TopPanelLogo />
          </LogoWrapper>
          <TopPanelTitle>
            <span style={{ color: 'rgb(80,111,145)' }}>א</span>
            <span style={{ color: '#ea4335' }}>י</span>
            <span style={{ color: '#fbbc05' }}>פ</span>
            <span style={{ color: 'rgb(80,111,145)' }}>ה</span>
            <span style={{ color: 'transparent' }}> </span>
            <span style={{ color: '#34a853' }}>ש</span>
            <span style={{ color: '#ea4335' }}>א</span>
            <span style={{ color: '#fbbc05' }}>ל</span>
            <span style={{ color: 'rgb(80,111,145)' }}>נ</span>
            <span style={{ color: '#34a853' }}>ו</span>
            <span style={{ color: '#ea4335' }}>?</span>
          </TopPanelTitle>
        </StyledTopPanel>
        
        <DashboardLayout>
          <MainContent>
            <SidePanel>
              <TabButton 
                active={activeView === 'questions'} 
                onClick={() => handleViewChange('questions')}
              >
                חיפוש שאלות
              </TabButton>
              <TabButton 
                active={activeView === 'segments'} 
                onClick={() => handleViewChange('segments')}
              >
                חיפוש לפי פילוח
              </TabButton>
            </SidePanel>

            <MainContentArea>
              <ContentArea>
                {activeView === 'questions' && (
                  <>
                    <SearchSection>
                      <SearchBox>
                        <Input
                          placeholder="הקלד/י את השאלה שלך כאן..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        {searchQuery && (
                          <div className="clear-icon" onClick={clearSearch}>
                            <ClearOutlined />
                          </div>
                        )}
                        <div className="search-icon" onClick={handleSearch}>
                          <SearchOutlined />
                        </div>
                      </SearchBox>
                      
                      {/* Always show threshold options */}
                      <FiltersRow>
                        <div style={{ marginLeft: 8, color: '#70757a', fontSize: 13 }}>
                          רמת דמיון:
                        </div>
                        {THRESHOLD_OPTIONS.map(option => (
                          <ThresholdChip
                            key={option.value}
                            className={threshold === option.value ? 'selected' : ''}
                            onClick={() => {
                              setThreshold(option.value);
                              if (searchQuery) handleSearch();
                            }}
                          >
                            {option.label}
                          </ThresholdChip>
                        ))}
                      </FiltersRow>
                    
                      {/* Only show panel filters when there are results */}
                      {uniquePanels.length > 0 && (
                        <FiltersRow>
                          <div style={{ marginLeft: 8, color: '#70757a', fontSize: 13 }}>
                            סינון לפי פאנל:
                          </div>
                          {uniquePanels.map(panel => (
                            <FilterChip
                              key={panel}
                              className={selectedPanel === panel ? 'active' : ''}
                              onClick={() => togglePanelFilter(panel)}
                            >
                              {panel}
                            </FilterChip>
                          ))}
                        </FiltersRow>
                      )}
                    </SearchSection>
                    
                    {/* Results */}
                    <ResultsContainer>
                      {loading ? (
                        <LoadingContainer>
                          <Spin size="large" />
                        </LoadingContainer>
                      ) : (
                        <>
                          {filteredResults.length > 0 ? (
                            <>
                              <div style={{ color: '#70757a', fontSize: '14px', marginBottom: '16px' }}>
                                נמצאו בערך {filteredResults.length} תוצאות
                              </div>
                              
                              {paginatedResults.map((result, index) => (
                                <ResultItem key={`${result.surveyId}-${index}`}>
                                  <div className="survey-header">
                                    <Link href={`/survey/${result.surveyId}`}>
                                      <a className="result-title">{result.surveyName}</a>
                                    </Link>
                                    {result.survey_score > 0 && (
                                      <ScoreCircle borderColor={getScoreColor(result.survey_score).borderColor}>
                                        {result.survey_score}
                                      </ScoreCircle>
                                    )}
                                  </div>
                                  <div 
                                    className="result-content" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: highlightMatches(result.question, searchQuery) 
                                    }}
                                  />
                                  <div className="result-metadata">
                                    {result.panel && (
                                      <>
                                        <span>בוצע על ידי: <strong>{result.panel}</strong></span>
                                        <span style={{ margin: '0 6px' }}>•</span>
                                      </>
                                    )}
                                    <CalendarOutlined style={{ fontSize: '12px' }} />
                                    <span>{formatDate(result.surveyDate)}</span>
                                  </div>
                                  <div className="result-url">
                                    {result.segments.length > 0 && result.segments.map((segment, i) => (
                                      <span key={i} className="segment-tag">
                                        {segment}
                                      </span>
                                    ))}
                                  </div>
                                </ResultItem>
                              ))}
                              
                              {filteredResults.length > 0 && (
                                <StyledPagination
                                  current={currentPage}
                                  onChange={setCurrentPage}
                                  total={filteredResults.length}
                                  pageSize={pageSize}
                                  showSizeChanger={false}
                                  size="small"
                                  hideOnSinglePage={false}
                                />
                              )}
                            </>
                          ) : (
                            searchQuery && !loading && (
                              <NoResults
                                description="לא נמצאו תוצאות תואמות"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            )
                          )}
                        </>
                      )}
                    </ResultsContainer>
                  </>
                )}
                
                {activeView === 'segments' && (
                  <>
                    {loadingSegments ? (
                      <LoadingContainer>
                        <Spin size="large" />
                      </LoadingContainer>
                    ) : (
                      <>
                        <FiltersRow style={{ marginTop: '16px' }}>
                          <div style={{ marginLeft: 8, color: '#70757a', fontSize: 13, marginBottom: '8px', width: '100%' }}>
                            בחר מקטע לסינון:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                            {allSegments.map(segment => (
                              <FilterChip
                                key={segment}
                                className={selectedSegment === segment ? 'active' : ''}
                                onClick={() => {
                                  setSelectedSegment(selectedSegment === segment ? '' : segment);
                                  handleSegmentFilterSelect(segment);
                                }}
                              >
                                {segment}
                              </FilterChip>
                            ))}
                          </div>
                        </FiltersRow>
                        
                        {loading ? (
                          <LoadingContainer>
                            <Spin size="large" />
                          </LoadingContainer>
                        ) : selectedSegment ? (
                          <>
                            {filteredResults.length > 0 ? (
                              <>
                                <div style={{ color: '#70757a', fontSize: '14px', marginBottom: '16px', marginTop: '24px' }}>
                                  נמצאו {filteredResults.length} שאלות במקטע "{selectedSegment}"
                                </div>
                                
                                {paginatedResults.map((result, index) => (
                                  <ResultItem key={`segment-filter-${index}`}>
                                    <div className="survey-header">
                                      <Link href={`/survey/${result.surveyId}`}>
                                        <a className="result-title">{result.surveyName}</a>
                                      </Link>
                                      {result.survey_score > 0 && (
                                        <ScoreCircle borderColor={getScoreColor(result.survey_score).borderColor}>
                                          {result.survey_score}
                                        </ScoreCircle>
                                      )}
                                    </div>
                                    <div 
                                      className="result-content" 
                                      dangerouslySetInnerHTML={{ 
                                        __html: highlightMatches(result.question, selectedSegment.startsWith('segment:') ? '' : searchQuery) 
                                      }}
                                    />
                                    <div className="result-metadata">
                                      {result.panel && (
                                        <>
                                          <span>בוצע על ידי: <strong>{result.panel}</strong></span>
                                          <span style={{ margin: '0 6px' }}>•</span>
                                        </>
                                      )}
                                      <CalendarOutlined style={{ fontSize: '12px' }} />
                                      <span>{formatDate(result.surveyDate)}</span>
                                    </div>
                                    <div className="result-url">
                                      {result.panel && <span className="panel-tag">{result.panel}</span>}
                                    </div>
                                  </ResultItem>
                                ))}
                                
                                {filteredResults.length > 0 && (
                                  <StyledPagination
                                    current={currentPage}
                                    onChange={setCurrentPage}
                                    total={filteredResults.length}
                                    pageSize={pageSize}
                                    showSizeChanger={false}
                                    size="small"
                                    hideOnSinglePage={false}
                                  />
                                )}
                              </>
                            ) : (
                              <NoResults 
                                description={`לא נמצאו שאלות במקטע "${selectedSegment}"`}
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                              />
                            )}
                          </>
                        ) : (
                          // Display segments in collapse format when no specific segment is selected
                          <StyledCollapse>
                            {segments.map((segment, index) => (
                              <Collapse.Panel 
                                key={index} 
                                header={`${segment.segmentName} (${segment.surveys.length} סקרים)`}
                              >
                                {segment.surveys.map((survey, sIndex) => (
                                  <SurveyItem 
                                    key={sIndex} 
                                    style={{ 
                                      borderBottom: sIndex < segment.surveys.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}
                                  >
                                    <Link href={`/survey/${survey.surveyId}`}>
                                      <a className="survey-title">
                                        {survey.surveyName}
                                      </a>
                                    </Link>
                                    <div className="survey-date">
                                      <CalendarOutlined />
                                      {formatDate(survey.surveyDate)}
                                    </div>
                                  </SurveyItem>
                                ))}
                              </Collapse.Panel>
                            ))}
                          </StyledCollapse>
                        )}
                        
                        {!selectedSegment && segments.length === 0 && (
                          <NoResults
                            description="לא נמצאו פילוחים"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </ContentArea>
            </MainContentArea>
          </MainContent>
        </DashboardLayout>
      </PageContainer>
    </PageWrapper>
  );
};

export default SearchQuestionsPage;
