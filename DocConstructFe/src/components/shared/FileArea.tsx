import React from "react";
import styled from 'styled-components';
import { FaTrash, FaUpload, FaDownload, FaRedoAlt, FaEye, FaEnvelope } from "react-icons/fa";
import {
  DialogOverlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogCloseButton
} from '../../styles/SharedStyles';
import { toast } from 'react-toastify';

export interface FileAreaDocument {
  fileName: string | null;
  fileType: string;
  fileId?: string;
  state: 'uploaded' | 'missing';
}

// Container for the entire file area
const FileAreaContainer = styled.div`
  grid-column: span 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #fff;
  padding-bottom: 20px; /* Add space at the bottom after scrolling */
`;

// Individual file item: receives `disabled` and `state`
const FileItemContainer = styled.div<{ disabled: boolean; state: 'uploaded' | 'missing' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: ${p =>
    p.state === 'missing' ? '#ffe5e5'
    : p.disabled     ? '#f0f4f8'
                     : '#fafafa'};
  border: 1px solid ${p => p.state === 'missing' ? '#f5c6cb' : '#e1e8f0'};
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s, transform 0.1s;

  &:hover {
    background-color: ${p =>
      p.state === 'missing' ? '#ffdddd'
      : p.disabled     ? '#f0f4f8'
                       : '#f5f7fa'};
    transform: ${p => p.disabled ? 'none' : 'scale(1.01)'};
  }
`;

// Badge showing file type
const FileTypeBadge = styled.span<{ state: 'uploaded' | 'missing' }>`
  background-color: ${p => p.state === 'missing' ? '#f5c6cb' : '#e1e8f0'};
  color: ${p => p.state === 'missing' ? '#721c24' : '#495057'};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  display: inline-block;
`;

// Name of the file, with dark red for missing
const FileName = styled.span<{ state: 'uploaded' | 'missing' }>`
  font-size: 14px;
  color: ${p => p.state === 'missing' ? '#672525' : '#33475b'};
  word-break: break-all;
`;

// Container for action icons
const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

// Unified button; accepts an optional `danger` prop
const ActionButton = styled.button<{ disabled: boolean; danger?: boolean }>`
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  padding: 4px;
  transition: color 0.2s;
  color: ${p =>
    p.disabled       ? '#a0adc0'
    : p.danger       ? '#a00'
                    : '#5c95d3'};

  &:hover {
    color: ${p =>
      p.disabled       ? '#a0adc0'
      : p.danger       ? '#800'
                      : '#3d76b1'};
  }
`;

// PDF Preview Dialog
export const FilePreview: React.FC<{
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}> = ({ fileUrl, fileName, onClose }) => (
  <DialogOverlay onClick={onClose}>
    <DialogContainer onClick={e => e.stopPropagation()}>
      <DialogHeader>
        <DialogTitle>Preview: {fileName}</DialogTitle>
        <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
      </DialogHeader>
      <div style={{ padding: 16, minHeight: 500 }}>
        <iframe
          src={fileUrl}
          title={fileName}
          width="100%"
          height="500px"
          style={{ border: 'none' }}
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
  fileName: string;
}> = ({ isOpen, onClose, onSend, fileName }) => {
  const [email, setEmail] = React.useState('');
  if (!isOpen) return null;
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Send "{fileName}" to signer</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <label style={{ fontWeight: 500, fontSize: 16 }}>Signer Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email"
            style={{ width: '100%', margin: '12px 0 24px 0', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 18px', borderRadius: 4, border: 'none', background: '#eee', color: '#333', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            <button type="button" onClick={() => { onSend(email); setEmail(''); }} style={{ padding: '8px 18px', borderRadius: 4, border: 'none', background: '#5c95d3', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      </DialogContainer>
    </DialogOverlay>
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
    <DialogOverlay>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Select Upload Mode</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 500, fontSize: 16, marginBottom: 12 }}>How do you want to fill the document?</label>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input type="radio" name="upload-mode" value="auto" checked={mode === 'auto'} onChange={() => setMode('auto')} style={{ marginRight: 8 }} />
                Auto fill
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input type="radio" name="upload-mode" value="manual" checked={mode === 'manual'} onChange={() => setMode('manual')} style={{ marginRight: 8 }} />
                Manual
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 18px', borderRadius: 4, border: 'none', background: '#eee', color: '#333', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            <button type="button" onClick={() => onConfirm(mode)} style={{ padding: '8px 18px', borderRadius: 4, border: 'none', background: '#5c95d3', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Continue</button>
          </div>
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Single FileItem component
const FileItem: React.FC<{
  fileId: string;
  fileName: string;
  fileType: string;
  state: 'uploaded' | 'missing';
  disabled: boolean;
  onUpload?: (fileType: string, file: File) => void;
  onDownload?: (fileId: string, fileName: string) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onRequestUpload: (fileType: string, file: File) => void;
}> = ({ fileId, fileName, fileType, state, disabled, onUpload, onDownload, onDelete, onPreview, onRequestUpload }) => {
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);

  const handleUpload = async () => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        onRequestUpload(fileType, file);
      }
    };
    input.click();
  };

  const handleDownload = () => {
    if (!onDownload || !fileId) return;
    onDownload(fileId, fileName);
  };

  const handleDelete = () => {
    if (disabled || !onDelete || !fileId) return;
    onDelete(fileId);
  };

  const isPdf = fileName && fileName.toLowerCase().endsWith('.pdf');

  return (
    <FileItemContainer disabled={disabled} state={state}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <FileTypeBadge state={state}>{fileType}</FileTypeBadge>
        </div>
        <FileName state={state}>
          {state === 'uploaded' ? fileName : 'No file uploaded'}
        </FileName>
      </div>

      <Actions>
        {state === 'uploaded' ? (
          <>
            {isPdf && onPreview && (
              <ActionButton
                onClick={() => onPreview(fileId, fileName)}
                disabled={false}
                aria-label="Preview"
                title="Preview PDF"
              >
                <FaEye />
              </ActionButton>
            )}
            <ActionButton
              onClick={handleDownload}
              disabled={false}
              danger={false}
              aria-label="Download"
              title="Download file"
            >
              <FaDownload />
            </ActionButton>
            <ActionButton
              onClick={handleUpload}
              disabled={disabled}
              aria-label="Re-upload"
              title="Re-upload file"
            >
              <FaRedoAlt />
            </ActionButton>
            <ActionButton
              onClick={() => setShowEmailDialog(true)}
              disabled={false}
              aria-label="Send to signer by email"
              title="Send to signer by email"
            >
              <FaEnvelope />
            </ActionButton>
            <ActionButton
              danger
              onClick={handleDelete}
              disabled={disabled}
              aria-label="Delete"
              title="Delete file"
            >
              <FaTrash />
            </ActionButton>
            <EmailDialog
              isOpen={showEmailDialog}
              onClose={() => setShowEmailDialog(false)}
              onSend={email => {
                setShowEmailDialog(false);
                toast.success(`File sent to ${email} (simulated)`);
              }}
              fileName={fileName}
            />
          </>
        ) : (
          <ActionButton
            onClick={handleUpload}
            disabled={disabled}
            aria-label="Upload"
            title="Upload file"
          >
            <FaUpload />
          </ActionButton>
        )}
      </Actions>
    </FileItemContainer>
  );
};

// Main FileArea component
const FileArea: React.FC<{ 
  files: FileAreaDocument[]; 
  disabled: boolean;
  onUpload?: (fileType: string, file: File) => void;
  onDownload?: (fileId: string, fileName: string) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
}> = ({ 
  files, 
  disabled, 
  onUpload, 
  onDownload, 
  onDelete, 
  onPreview 
}) => {
  const [showUploadModeDialog, setShowUploadModeDialog] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [pendingFileType, setPendingFileType] = React.useState<string | null>(null);

  const handleRequestUpload = (fileType: string, file: File) => {
    setPendingFile(file);
    setPendingFileType(fileType);
    setShowUploadModeDialog(true);
  };

  const handleConfirmUploadMode = (mode: 'auto' | 'manual') => {
    setShowUploadModeDialog(false);
    if (pendingFile && pendingFileType && onUpload) {
      // For demo
      onUpload(pendingFileType, pendingFile);
    }
    setPendingFile(null);
    setPendingFileType(null);
  };

  return (
    <FileAreaContainer>
      {files.map((file, idx) => (
        <FileItem
          key={idx}
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
        />
      ))}
      <UploadModeDialog
        isOpen={showUploadModeDialog}
        onClose={() => { setShowUploadModeDialog(false); setPendingFile(null); setPendingFileType(null); }}
        onConfirm={handleConfirmUploadMode}
      />
    </FileAreaContainer>
  );
};

export default FileArea;
