import React, { useState } from "react";
import styled from 'styled-components';
import { FaTrash, FaUpload, FaDownload, FaEye, FaEnvelope, FaPlus, FaFileAlt } from "react-icons/fa";
import {
  DialogOverlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogActions,
  Button
} from '../../styles/SharedStyles';
import { toast } from 'react-toastify';
import { DocumentState } from "../../types";

export interface FileAreaDocument {
  fileName: string | null;
  fileType: string;
  fileId?: string;
  state: DocumentState;
}

// Container for the entire file area - redesigned with Apple-style aesthetics
const FileAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 12px;
`;

// Main file area with tabs
const FileAreaContent = styled.div`
  display: flex;
  flex-direction: column;
`;

// Tabs for switching between categorized and general files
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${p => p.active ? '#0071e3' : 'transparent'};
  color: ${p => p.active ? '#0071e3' : '#666'};
  font-weight: ${p => p.active ? '600' : '400'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #0071e3;
  }
`;

// Section header with action buttons
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 16px;
`;

// Container for the file list - modified to remove scrolling
const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 16px;
  overflow-y: visible;
`;

const BatchActions = styled.div`
  display: flex;
  gap: 8px;
`;

// Individual file item with Apple design influence
const FileItemContainer = styled.div<{ disabled: boolean; state: 'uploaded' | 'missing' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: ${p =>
    p.state === 'missing' ? '#fff8f8'
    : p.disabled     ? '#f9f9f9'
                     : '#ffffff'};
  border: 1px solid ${p => p.state === 'missing' ? '#ffdddd' : '#f0f0f0'};
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    background-color: ${p =>
      p.state === 'missing' ? '#fff5f5'
      : p.disabled     ? '#f9f9f9'
                       : '#f9f9f9'};
    transform: ${p => p.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${p => p.disabled ? '0 1px 2px rgba(0, 0, 0, 0.03)' : '0 3px 6px rgba(0, 0, 0, 0.06)'};
  }
`;

// Left side of file item with icon and info
const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* Allows text to truncate */
`;

const FileIcon = styled.div<{ state: DocumentState }>`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
  background-color: ${p => p.state === DocumentState.MISSING ? '#fff0f0' : '#f0f7ff'};
  color: ${p => p.state === DocumentState.MISSING ? '#ff6b6b' : '#0071e3'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; /* Enables text truncation */
`;

// Badge showing file type
const FileTypeBadge = styled.span<{ state: DocumentState }>`
  background-color: ${p => p.state === DocumentState.MISSING ? '#ffefef' : '#f0f7ff'};
  color: ${p => p.state === DocumentState.MISSING ? '#ff6b6b' : '#0071e3'};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
  display: inline-block;
`;

// Name of the file, with Apple-style typography
const FileName = styled.span<{ state: DocumentState }>`
  font-size: 13px;
  font-weight: 500;
  color: ${p => p.state === DocumentState.MISSING ? '#ff6b6b' : '#333'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Container for action icons
const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

// Apple-style button
const ActionButton = styled.button<{ disabled: boolean; danger?: boolean }>`
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  padding: 5px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: ${p =>
    p.disabled       ? '#ccc'
    : p.danger       ? '#ff3b30'
                    : '#0071e3'};
  opacity: ${p => p.disabled ? 0.5 : 1};

  &:hover {
    background-color: ${p => 
      p.disabled ? 'transparent' 
      : p.danger ? '#fff5f5' 
      : '#f0f7ff'};
  }
`;

// Upload area - more compact
const UploadArea = styled.div<{ isDragging: boolean; disabled: boolean }>`
  border: 2px dashed ${p => p.isDragging ? '#0071e3' : '#e0e0e0'};
  border-radius: 10px;
  padding: 16px;
  margin: 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${p => p.isDragging ? '#f0f7ff' : '#f9f9f9'};
  transition: all 0.2s ease;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  
  &:hover {
    background-color: ${p => p.disabled ? '#f9f9f9' : '#f0f7ff'};
    border-color: ${p => p.disabled ? '#e0e0e0' : '#0071e3'};
  }
`;

const UploadContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UploadIcon = styled.div`
  font-size: 20px;
  color: #0071e3;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666;
`;

// PDF Preview Dialog with Apple-style design
export const FilePreview: React.FC<{
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}> = ({ fileUrl, fileName, onClose }) => (
  <DialogOverlay 
    onClick={onClose}
    style={{ 
      justifyContent: 'flex-end', 
      alignItems: 'stretch',
      background: 'rgba(0, 0, 0, 0.4)'
    }}
  >
    <DialogContainer 
      onClick={e => e.stopPropagation()} 
      style={{ 
        margin: '0',
        borderRadius: '16px 0 0 16px',
        width: '45%',
        maxWidth: '600px',
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-2px 0 25px rgba(0, 0, 0, 0.2)'
      }}
    >
      <DialogHeader>
        <DialogTitle>{fileName}</DialogTitle>
        <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
      </DialogHeader>
      <div style={{ 
        padding: '16px', 
        flex: '1', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <iframe
          src={fileUrl}
          title={fileName}
          width="100%"
          style={{ 
            border: 'none',
            flex: '1',
            minHeight: '500px',
            borderRadius: '8px'
          }}
        />
      </div>
    </DialogContainer>
  </DialogOverlay>
);

// Email Dialog for sending file to signer
const EmailDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
  fileNames: string[];
}> = ({ isOpen, onClose, onSend, fileNames }) => {
  const [email, setEmail] = React.useState('');
  if (!isOpen) return null;
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()} style={{ borderRadius: '16px', maxWidth: '450px' }}>
        <DialogHeader>
          <DialogTitle>Send {fileNames.length > 1 ? `${fileNames.length} files` : `"${fileNames[0]}"`}</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <label style={{ fontWeight: 500, fontSize: 16, display: 'block', marginBottom: '8px' }}>Recipient Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email address"
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '16px', 
              borderRadius: '8px', 
              border: '1px solid #e0e0e0',
              marginBottom: '24px'
            }}
            autoFocus
          />
          <DialogActions style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="text" onClick={onClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => { onSend(email); setEmail(''); }}
              style={{ 
                backgroundColor: '#0071e3',
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              Send
            </Button>
          </DialogActions>
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Single FileItem component with redesigned Apple look
const FileItem: React.FC<{
  fileId: string;
  fileName: string;
  fileType: string;
  state: DocumentState;
  disabled: boolean;
  onUpload?: (fileType: string, file: File) => void;
  onDownload?: (fileId: string, fileName: string) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onRequestUpload: (fileType: string, file: File) => void;
  onSelect?: (fileId: string, selected: boolean) => void;
  selected?: boolean;
}> = ({ 
  fileId, 
  fileName, 
  fileType, 
  state, 
  disabled, 
  onUpload, 
  onDownload, 
  onDelete, 
  onPreview, 
  onRequestUpload,
  onSelect,
  selected
}) => {
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);

  const handleUpload = async () => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      onRequestUpload(fileType, file);
    };
    
    input.click();
  };

  const handleDownload = () => {
    if (state === DocumentState.MISSING || !onDownload) return;
    onDownload(fileId, fileName || '');
  };

  const handleDelete = () => {
    if (disabled || state === DocumentState.MISSING || !onDelete) return;
    onDelete(fileId);
  };

  const handlePreview = () => {
    if (state === DocumentState.MISSING || !onPreview) return;
    onPreview(fileId, fileName || '');
  };

  const handleSendEmail = (email: string) => {
    // Handle sending email
    setShowEmailDialog(false);
    toast.success(`Email sent to ${email}`);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect && state === DocumentState.UPLOADED) {
      onSelect(fileId, e.target.checked);
    }
  };

  return (
    <>
      <FileItemContainer disabled={disabled} state={state}>
        <FileInfo>
          {onSelect && state === DocumentState.UPLOADED && (
            <input 
              type="checkbox" 
              checked={selected} 
              onChange={handleCheckboxChange}
              disabled={false}
              style={{ marginRight: '4px' }}
            />
          )}
          <FileIcon state={state}>
            <FaFileAlt />
          </FileIcon>
          <FileDetails>
            <FileTypeBadge state={state}>{fileType}</FileTypeBadge>
            <FileName state={state}>
              {state === DocumentState.UPLOADED ? fileName : 'Missing document'}
            </FileName>
          </FileDetails>
        </FileInfo>
        
        <Actions>
          {state === DocumentState.MISSING ? (
            <ActionButton 
              disabled={disabled} 
              onClick={handleUpload}
              title="Upload document"
            >
              <FaUpload />
            </ActionButton>
          ) : (
            <>
              <ActionButton 
                disabled={false}
                onClick={handlePreview}
                title="Preview"
              >
                <FaEye />
              </ActionButton>
              <ActionButton 
                disabled={false}
                onClick={handleDownload}
                title="Download"
              >
                <FaDownload />
              </ActionButton>
              <ActionButton 
                disabled={false}
                onClick={() => setShowEmailDialog(true)}
                title="Send email"
              >
                <FaEnvelope />
              </ActionButton>
              <ActionButton 
                disabled={disabled} 
                danger 
                onClick={handleDelete}
                title="Delete"
              >
                <FaTrash />
              </ActionButton>
            </>
          )}
        </Actions>
      </FileItemContainer>

      {/* Email Dialog */}
      <EmailDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={handleSendEmail}
        fileNames={[fileName || '']}
      />
    </>
  );
};

// Main FileArea component with tabbed interface
const FileArea: React.FC<{ 
  files: FileAreaDocument[]; 
  disabled: boolean;
  onUpload?: (fileType: string, file: File) => void;
  onDownload?: (fileId: string, fileName: string) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onUploadGeneral?: (file: File) => void;
}> = ({ 
  files, 
  disabled, 
  onUpload, 
  onDownload, 
  onDelete, 
  onPreview,
  onUploadGeneral
}) => {
  const [activeTab, setActiveTab] = useState<'categorized' | 'general'>('categorized');
  const [categorizedFiles, setCategorizedFiles] = useState<FileAreaDocument[]>(
    files.filter(file =>  file.fileType !== 'כללי')
  );
  const [generalFiles, setGeneralFiles] = useState<FileAreaDocument[]>(
    files.filter(file =>  file.fileType === 'כללי')
  );
  
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModeDialog, setShowUploadModeDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ fileType: string; file: File } | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Update files when props change
  React.useEffect(() => {
    setCategorizedFiles(files.filter(file =>  file.fileType !== 'כללי'));
    setGeneralFiles(files.filter(file =>  file.fileType === 'כללי'));
  }, [files]);

  const handleRequestUpload = (fileType: string, file: File) => {
    setPendingUpload({ fileType, file });
    setShowUploadModeDialog(true);
  };

  const handleConfirmUploadMode = (mode: 'auto' | 'manual') => {
    if (pendingUpload && onUpload) {
      onUpload(pendingUpload.fileType, pendingUpload.file);
    }
    setShowUploadModeDialog(false);
    setPendingUpload(null);
  };
  
  const handleSelectFile = (fileId: string, selected: boolean) => {
    if (selected) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };
  
  const handleBatchDownload = () => {
    if (!onDownload) return;
    
    // Get selected file info
    const filesToDownload = files.filter(file => 
      file.state === DocumentState.UPLOADED && 
      selectedFiles.includes(file.fileId || '')
    );
    
    // Download each file
    filesToDownload.forEach(file => {
      if (file.fileId && file.fileName) {
        onDownload(file.fileId, file.fileName);
      }
    });
    
    toast.success(`Downloading ${filesToDownload.length} files`);
  };
  
  const handleBatchEmail = () => {
    if (selectedFiles.length === 0) return;
    setShowEmailDialog(true);
  };
  
  const handleSendBatchEmail = (email: string) => {
    // Get selected file names for the success message
    const selectedFileNames = files
      .filter(file => file.state === DocumentState.UPLOADED && selectedFiles.includes(file.fileId || ''))
      .map(file => file.fileName || '');
    
    setShowEmailDialog(false);
    toast.success(`${selectedFileNames.length} files sent to ${email}`);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || !onUploadGeneral) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUploadGeneral(files[0]);
    }
  };
  
  const handleGeneralUploadClick = () => {
    if (disabled || !onUploadGeneral) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      onUploadGeneral(files[0]);
    };
    
    input.click();
  };

  // Get file names for email dialog
  const selectedFileNames = files
    .filter(file => file.state === DocumentState.UPLOADED && selectedFiles.includes(file.fileId || ''))
    .map(file => file.fileName || '');

  return (
    <FileAreaContainer>
      <TabsContainer>
        <Tab 
          active={activeTab === 'categorized'} 
          onClick={() => setActiveTab('categorized')}
        >
         מסמכי תחילת עבודה
        </Tab>
        <Tab 
          active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')}
        >
          מסמכים כלליים
        </Tab>
      </TabsContainer>
      
      <FileAreaContent>
        {activeTab === 'categorized' && (
          <>
            <SectionHeader>
              {selectedFiles.length > 0 && (
                <BatchActions>
                  <ActionButton 
                    disabled={false}
                    onClick={handleBatchDownload}
                    title="Download selected"
                  >
                    <FaDownload />
                  </ActionButton>
                  <ActionButton 
                    disabled={false}
                    onClick={handleBatchEmail}
                    title="Email selected"
                  >
                    <FaEnvelope />
                  </ActionButton>
                </BatchActions>
              )}
            </SectionHeader>
            
            <FileListContainer>
              {categorizedFiles.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  אין מסמכים זמינים בקטגוריה זו
                </div>
              ) : (
                categorizedFiles.map((file, index) => (
                  <FileItem
                    key={`${file.fileType}-${index}`}
                    fileId={file.fileId || ''}
                    fileName={file.fileName || ''}
                    fileType={file.fileType}
                    state={file.state}
                    disabled={disabled}
                    onUpload={onUpload}
                    onDownload={onDownload}
                    onDelete={onDelete}
                    onPreview={onPreview}
                    onRequestUpload={handleRequestUpload}
                    onSelect={handleSelectFile}
                    selected={selectedFiles.includes(file.fileId || '')}
                  />
                ))
              )}
            </FileListContainer>
          </>
        )}
        
        {activeTab === 'general' && (
          <>
            {/* List of General Files */}
            <FileListContainer>
              {generalFiles.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  אין מסמכים כלליים זמינים
                </div>
              ) : (
                generalFiles.map((file, index) => (
                  <FileItem
                    key={`${file.fileType}-${index}`}
                    fileId={file.fileId || ''}
                    fileName={file.fileName || ''}
                    fileType={file.fileType}
                    state={file.state}
                    disabled={disabled}
                    onUpload={onUpload}
                    onDownload={onDownload}
                    onDelete={onDelete}
                    onPreview={onPreview}
                    onRequestUpload={handleRequestUpload}
                    onSelect={handleSelectFile}
                    selected={selectedFiles.includes(file.fileId || '')}
                  />
                ))
              )}
            </FileListContainer>
            
            {/* Upload Area for General Files */}
            {onUploadGeneral && (
              <UploadArea 
                isDragging={isDragging} 
                disabled={disabled}
                onClick={handleGeneralUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadContent>
                  <UploadIcon>
                    <FaPlus />
                  </UploadIcon>
                  <UploadText>גרור קובץ לכאן או לחץ כדי להעלות</UploadText>
                </UploadContent>
              </UploadArea>
            )}
          </>
        )}
      </FileAreaContent>
      
      {/* Email Dialog for batch operations */}
      <EmailDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={handleSendBatchEmail}
        fileNames={selectedFileNames}
      />
      
      {/* Upload Mode Dialog */}
      <UploadModeDialog
        isOpen={showUploadModeDialog}
        onClose={() => {
          setShowUploadModeDialog(false);
          setPendingUpload(null);
        }}
        onConfirm={handleConfirmUploadMode}
      />
    </FileAreaContainer>
  );
};

// Upload Mode Dialog for choosing Auto fill or Manual
const UploadModeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'auto' | 'manual') => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [mode, setMode] = React.useState<'auto' | 'manual'>('auto');
  React.useEffect(() => { if (isOpen) setMode('auto'); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <DialogOverlay style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <DialogContainer 
        onClick={e => e.stopPropagation()} 
        style={{ borderRadius: '16px', maxWidth: '450px' }}
      >
        <DialogHeader>
          <DialogTitle>Select Upload Mode</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 500, fontSize: 16, marginBottom: 12 }}>How do you want to fill the document?</label>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input 
                  type="radio" 
                  name="upload-mode" 
                  value="auto" 
                  checked={mode === 'auto'} 
                  onChange={() => setMode('auto')} 
                  style={{ marginRight: 8 }} 
                />
                Auto fill
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input 
                  type="radio" 
                  name="upload-mode" 
                  value="manual" 
                  checked={mode === 'manual'} 
                  onChange={() => setMode('manual')} 
                  style={{ marginRight: 8 }} 
                />
                Manual
              </label>
            </div>
          </div>
          <DialogActions style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="text" onClick={onClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => onConfirm(mode)}
              style={{ 
                backgroundColor: '#0071e3',
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              Continue
            </Button>
          </DialogActions>
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default FileArea;
